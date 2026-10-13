import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import { Visitor, parseSync } from 'vite';
import { describe, expect, it } from 'vitest';

import { BRAND_CLASS, NAV_LINK_CLASS, TRAILING_CLASS } from '#routes/{-$locale}/-/site/header-classes';

import { jsFiles, read } from './client-output';

const escaped = (text: string): string => text.replaceAll(/[$()*+.?[\\\]^{|}]/gu, String.raw`\$&`);

/** The class list as an argument to a call, i.e. with the marker still around it. */
const wrappedIn = (list: string): RegExp => new RegExp(String.raw`[\w$]\(\s*['"\u0060]${escaped(list)}`, 'u');

/** The class list as a whole string literal, in any of the three quotes the minifier may pick. */
const quoted = (list: string): RegExp => new RegExp(String.raw`(['"\u0060])${escaped(list)}\1`, 'u');

/** The class list as the sole argument of a call, which is what a marker `stripTw` missed leaves behind. */
const calledWith = (list: string): RegExp => new RegExp(String.raw`[\w$]\(\s*(['"\u0060])${escaped(list)}\1\s*\)`, 'u');

const BUNDLES = jsFiles().map(file => ({ file, code: read(file) }));

/**
 * Every source file that can hold a marker.
 * `git grep --untracked` takes milliseconds over `src`, includes files not yet committed, honours `.gitignore`, and pre-filters on the same `tw(` needle as `stripTw`'s own `code` filter.
 */
const markerFiles = (): string[] =>
  execFileSync('git', ['grep', '-l', '--untracked', '-F', 'tw(', '--', 'src/*.ts', 'src/*.tsx'], { encoding: 'utf8' })
    .split('\n')
    .filter(file => file !== '');

/** The literal argument of every `tw(...)` call in `src`, with the file it sits in. */
const markedLists = (): { file: string; list: string }[] =>
  markerFiles().flatMap(file => {
    const lists: { file: string; list: string }[] = [];
    new Visitor({
      CallExpression(node) {
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'tw') return;
        const argument = node.arguments.at(0);
        // `stripTw` only removes a call with one string literal, so anything else is reported under a list no bundle can contain.
        const literal = node.arguments.length === 1 && argument?.type === 'Literal' && typeof argument.value === 'string' ? argument.value : null;
        lists.push({ file, list: literal ?? `a tw() call at offset ${node.start} that stripTw cannot strip` });
      },
    }).visit(parseSync(file, readFileSync(file, 'utf8')).program);

    return lists;
  });

/**
 * Artifact-only. `test/source/strip-tw.test.ts` pins what the plugin does to a
 * module it is handed; this is the end of the chain — that it was handed the real
 * ones. Between them sit `vite:react-compiler`, which runs first and whose output
 * shape the marker has to survive, the `code: 'tw('` filter deciding which real
 * modules the handler ever sees, and the chunking that decides where the class
 * lists land. None of the three is visible from a single-module build.
 *
 * Reading `src` does not make the last test a source test: it only names which strings to look for, and every verdict is read off the built bundle.
 */
describe('the tw() markers are stripped from the client bundle', () => {
  it.each([
    ['BRAND_CLASS', BRAND_CLASS],
    ['TRAILING_CLASS', TRAILING_CLASS],
    ['NAV_LINK_CLASS', NAV_LINK_CLASS],
  ])('ships %s as a bare string literal, not as the argument of a call', (_name, list) => {
    const holders = BUNDLES.filter(({ code }) => code.includes(list));

    expect(holders.length).toBeGreaterThan(0);
    expect(holders.filter(({ code }) => wrappedIn(list).test(code)).map(({ file }) => file)).toStrictEqual([]);
  });

  it('ships every tw()-marked class list in src as a whole string literal, and none as the argument of a call', () => {
    const marked = markedLists();

    expect(marked.length).toBeGreaterThan(0);
    expect(
      marked
        .filter(({ list }) => !BUNDLES.some(({ code }) => quoted(list).test(code)) || BUNDLES.some(({ code }) => calledWith(list).test(code)))
        .map(({ file, list }) => `${file}: ${list}`),
    ).toStrictEqual([]);
  });
});
