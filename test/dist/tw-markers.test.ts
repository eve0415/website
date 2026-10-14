import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import { Visitor, parseSync } from 'vite';
import { describe, expect, it } from 'vitest';

import { jsFiles, read } from './client-output';

const escaped = (text: string): string => text.replaceAll(/[$()*+.?[\\\]^{|}]/gu, String.raw`\$&`);

/** The class list as a whole string literal, in any of the three quotes the minifier may pick. */
const quoted = (list: string): RegExp => new RegExp(String.raw`(['"\u0060])${escaped(list)}\1`, 'u');

/** The class list as the sole argument of a call, which is what a marker `stripTw` missed leaves behind. */
const calledWith = (list: string): RegExp => new RegExp(String.raw`[\w$]\(\s*(['"\u0060])${escaped(list)}\1\s*\)`, 'u');

const BUNDLES = jsFiles().map(file => ({ file, code: read(file) }));

/**
 * Every source file that can import the marker, including files with only a bare reference.
 * `git grep --untracked` includes uncommitted files and honours `.gitignore`.
 */
const markerFiles = (): string[] =>
  execFileSync('git', ['grep', '-l', '--untracked', '-F', '#lib/tw', '--', 'src/*.ts', 'src/*.tsx'], { encoding: 'utf8' })
    .split('\n')
    .filter(file => file !== '');

/** What one source file marks: the literal of each call `stripTw` strips, and every use of `tw` it cannot. */
interface Marked {
  lists: { file: string; list: string }[];
  unstrippable: string[];
}

const marked = (): Marked => {
  const result: Marked = { lists: [], unstrippable: [] };
  for (const file of markerFiles()) {
    const { program } = parseSync(file, readFileSync(file, 'utf8'));
    const imports = program.body.filter(
      node =>
        node.type === 'ImportDeclaration' &&
        node.source.value === '#lib/tw' &&
        node.specifiers.some(specifier => specifier.type === 'ImportSpecifier' && specifier.local.name === 'tw'),
    );
    if (imports.length === 0) continue;

    const identifiers = new Set<number>();
    const callCallees = new Set<number>();
    const nonReferences = new Set<number>();
    new Visitor({
      CallExpression(node) {
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'tw') return;
        callCallees.add(node.callee.start);
        const argument = node.arguments.at(0);
        // `stripTw` only removes a call with exactly one string literal.
        if (node.arguments.length === 1 && argument?.type === 'Literal' && typeof argument.value === 'string') {
          result.lists.push({ file, list: argument.value });
        } else {
          result.unstrippable.push(`${file}: a tw() call at offset ${node.start}`);
        }
      },
      Identifier(node) {
        if (node.name === 'tw') identifiers.add(node.start);
      },
      MemberExpression(node) {
        if (!node.computed && node.property.type === 'Identifier') nonReferences.add(node.property.start);
      },
      Property(node) {
        if (!node.computed && !node.shorthand && node.key.type === 'Identifier') nonReferences.add(node.key.start);
      },
    }).visit(program);

    for (const offset of identifiers) {
      if (imports.some(node => node.start <= offset && offset < node.end)) continue;
      if (callCallees.has(offset) || nonReferences.has(offset)) continue;
      result.unstrippable.push(`${file}: a tw reference at offset ${offset}`);
    }
  }

  return result;
};

/**
 * `test/source/strip-tw.test.ts` pins what the plugin does to a module it is handed; this checks the real imports, bare references and the client bundle.
 * Between source and bundle sit `vite:react-compiler`, the `code: 'tw('` filter, and chunking.
 *
 * Source identifies imports and references; the built bundle decides whether each valid call shipped as a bare string.
 */
describe('the tw() markers are stripped from the client bundle', () => {
  it('leaves no use of an imported tw that stripTw cannot strip', () => {
    expect(marked().unstrippable).toStrictEqual([]);
  });

  it('ships every imported tw()-marked list as a whole string literal, and none as the argument of a call', () => {
    const { lists } = marked();

    expect(lists.length).toBeGreaterThan(0);
    expect(
      lists
        .filter(({ list }) => {
          const asLiteral = quoted(list);
          const asArgument = calledWith(list);
          return !BUNDLES.some(({ code }) => asLiteral.test(code)) || BUNDLES.some(({ code }) => asArgument.test(code));
        })
        .map(({ file, list }) => `${file}: ${list}`),
    ).toStrictEqual([]);
  });
});
