import { describe, expect, it } from 'vitest';

import { BRAND_CLASS, NAV_LINK_CLASS, TRAILING_CLASS } from '#routes/{-$locale}/-/site/header-classes';

import { jsFiles, read } from './client-output';

const escaped = (text: string): string => text.replaceAll(/[$()*+.?[\\\]^{|}]/gu, String.raw`\$&`);

/** The class list as an argument to a call, i.e. with the marker still around it. */
const wrappedIn = (list: string): RegExp => new RegExp(String.raw`[\w$]\(\s*['"\u0060]${escaped(list)}`, 'u');

const BUNDLES = jsFiles().map(file => ({ file, code: read(file) }));

/**
 * Artifact-only. `test/source/strip-tw.test.ts` pins what the plugin does to a
 * module it is handed; this is the end of the chain — that it was handed the real
 * ones. Between them sit `vite:react-compiler`, which runs first and whose output
 * shape the marker has to survive, the `code: 'tw('` filter deciding which real
 * modules the handler ever sees, and the chunking that decides where the class
 * lists land. None of the three is visible from a single-module build.
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
});
