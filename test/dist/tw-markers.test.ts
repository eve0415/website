import { describe, expect, it } from 'vitest';

import { BRAND_CLASS, NAV_LINK_CLASS, TRAILING_CLASS } from '#routes/{-$locale}/-/site/header-classes';

import { jsFiles, read } from './client-output';

/**
 * A binding whose entire body is its own parameter — what `src/lib/tw.ts` becomes
 * once mangled (`Oe=e=>e`), in the shared chunk rather than beside the class lists.
 *
 * There is no assertion on the name `tw` here, or anywhere else in this file: the
 * client bundle is minified, `tw` is mangled to a single letter long before a test
 * looks at it, and with `stripTw` removed `grep -a 'tw('` over `dist/client` still
 * finds nothing. An assertion that cannot fail for the reason its name gives reads
 * as coverage to the next person, so there isn't one.
 *
 * Name-blind by necessity, and that is this assertion's own weakness: a dependency
 * shipping its own `x => x` into the shared chunk would fail it with nothing wrong
 * on our side. Kept anyway, because the identity binding is what an unstripped
 * marker leaves behind and nothing else in the output points at it.
 */
const IDENTITY_BINDING = /(?:^|[;,{(=\s])[A-Za-z_$][\w$]*\s*=\s*\(?([A-Za-z_$][\w$]*)\)?\s*=>\s*\1\s*(?=[,;)}\]]|$)/u;

const escaped = (text: string): string => text.replaceAll(/[$()*+.?[\\\]^{|}]/gu, String.raw`\$&`);

/** The class list as an argument to a call, i.e. with the marker still around it. */
const wrappedIn = (list: string): RegExp => new RegExp(String.raw`[\w$]\(\s*['"\u0060]${escaped(list)}`, 'u');

const BUNDLES = jsFiles().map(file => ({ file, code: read(file) }));

describe('the tw() markers are stripped from the client bundle', () => {
  it('ships no identity binding, which is what a surviving marker would leave in the shared chunk', () => {
    expect(BUNDLES.filter(({ code }) => IDENTITY_BINDING.test(code)).map(({ file }) => file)).toStrictEqual([]);
  });

  it.each([
    ['BRAND_CLASS', BRAND_CLASS],
    ['TRAILING_CLASS', TRAILING_CLASS],
    ['NAV_LINK_CLASS', NAV_LINK_CLASS],
  ])('ships %s as a bare string literal, not as the argument of a call', (_name, list) => {
    const holders = BUNDLES.filter(({ code }) => code.includes(list));

    expect(holders.length).toBeGreaterThan(0);
    expect(holders.filter(({ code }) => wrappedIn(list).test(code)).map(({ file }) => file)).toStrictEqual([]);
  });
});
