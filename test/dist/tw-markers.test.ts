import { describe, expect, it } from 'vitest';

import { BRAND_CLASS, NAV_LINK_CLASS, TRAILING_CLASS } from '#routes/{-$locale}/-/site/header-classes';

import { jsFiles, read } from './client-output';

/**
 * A call to the marker itself — not the tail of a minified identifier that ends
 * in `tw`, and not a member call.
 *
 * The client bundle is minified, so `tw` is mangled to a single letter long
 * before this looks at it and no build reaches here with the name intact. Kept
 * because it costs one pass and is the assertion that would fire if the client
 * build ever stopped mangling; the assertion below is the one that discriminates.
 */
const TW_CALL = /(?<![\w$.])tw\s*\(/u;

/**
 * A binding whose entire body is its own parameter — what `src/lib/tw.ts` becomes
 * once mangled (`Oe=e=>e`), in the shared chunk rather than beside the class lists.
 *
 * Name-blind by necessity: minification erases `tw`, so there is nothing more
 * specific to match. The cost is that a dependency shipping its own identity
 * binding would fail this.
 */
const IDENTITY_BINDING = /(?:^|[;,{(=\s])[A-Za-z_$][\w$]*\s*=\s*\(?([A-Za-z_$][\w$]*)\)?\s*=>\s*\1\s*(?=[,;)}\]]|$)/u;

const escaped = (text: string): string => text.replaceAll(/[$()*+.?[\\\]^{|}]/gu, String.raw`\$&`);

/** The class list as an argument to a call, i.e. with the marker still around it. */
const wrappedIn = (list: string): RegExp => new RegExp(String.raw`[\w$]\(\s*['"\u0060]${escaped(list)}`, 'u');

const BUNDLES = jsFiles().map(file => ({ file, code: read(file) }));

const carrying = (pattern: RegExp): string[] => BUNDLES.filter(({ code }) => pattern.test(code)).map(({ file }) => file);

describe('the tw() markers are stripped from the client bundle', () => {
  it('ships no call to the marker', () => {
    expect(carrying(TW_CALL)).toStrictEqual([]);
  });

  it('ships no identity function for such a call to reach', () => {
    expect(carrying(IDENTITY_BINDING)).toStrictEqual([]);
  });

  it.each([
    ['BRAND_CLASS', BRAND_CLASS],
    ['TRAILING_CLASS', TRAILING_CLASS],
    ['NAV_LINK_CLASS', NAV_LINK_CLASS],
  ])('ships %s as a bare string literal', (_name, list) => {
    const holders = BUNDLES.filter(({ code }) => code.includes(list));

    expect(holders.length).toBeGreaterThan(0);
    expect(holders.filter(({ code }) => wrappedIn(list).test(code)).map(({ file }) => file)).toStrictEqual([]);
  });
});
