import { expect, it } from 'vitest';

import { PAGES } from '../pages';

import { emittedFile, emittedForSsr } from './plugin-harness';

/**
 * `vite.config.ts`'s `sitemap()` plugin, driven through a real build rather than
 * read back off `dist/`: `sitemapXml` and the two namespace constants are locals
 * of that file, and the exported config is the only way in that does not add an
 * export.
 *
 * Every expectation comes from `test/pages.ts`'s literal table, never from
 * `localePath` — derived from the same function the plugin uses, both sides of a
 * `<loc>` assertion would move together and the test would pass on any origin.
 */
const sitemap = async (): Promise<string> => emittedFile('sitemap', 'sitemap.xml');

const textIn = (xml: string, tag: string): string[] => [...xml.matchAll(new RegExp(String.raw`<${tag}>([^<]*)</${tag}>`, 'gu'))].map(([, text = '']) => text);

interface Entry {
  loc: string;
  /** `[hreflang, href]`, in document order. */
  alternates: [string, string][];
}

const entryOf = (block: string): Entry => {
  const [, loc = ''] = /<loc>([^<]*)<\/loc>/u.exec(block) ?? [];
  const alternates = [...block.matchAll(/<xhtml:link rel="alternate" href="([^"]*)" hreflang="([^"]*)" \/>/gu)].map(
    ([, href = '', hreflang = '']): [string, string] => [hreflang, href],
  );

  return { loc, alternates };
};

/**
 * The scheme is part of the namespace name and namespaces match as exact
 * strings, so the `https` spelling — which the generator this replaces hardcodes
 * — is a different namespace, not a variant spelling of this one.
 */
it('declares the sitemap namespace in the spelling the protocol defines', async () => {
  expect(await sitemap()).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">');
});

it('lists every locale of every route exactly once', async () => {
  expect(textIn(await sitemap(), 'loc').toSorted()).toStrictEqual(PAGES.map(page => page.url).toSorted());
});

// Sorted on both sides: the sitemap's entry order comes from `ROUTE_SET` in
// vite.config.ts and `PAGES`'s from the transcribed table, and nothing holds
// those two orders together. The order that matters is the one inside each cluster.
const byLoc = (a: Entry, b: Entry): number => a.loc.localeCompare(b.loc);

it('gives every entry the whole hreflang cluster for its route', async () => {
  const xml = await sitemap();
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/gu)].map(([, block = '']) => entryOf(block));

  expect(entries.toSorted(byLoc)).toStrictEqual(PAGES.map(({ url, alternates }): Entry => ({ loc: url, alternates })).toSorted(byLoc));
});

// Shape only. The value is `new Date()` at build time, so asserting it would
// either re-derive the clock the plugin read or pin a date that goes stale.
it('stamps every entry with a date-shaped lastmod', async () => {
  const lastmods = textIn(await sitemap(), 'lastmod');

  expect(lastmods).toHaveLength(PAGES.length);
  expect(lastmods.filter(value => !/^\d{4}-\d{2}-\d{2}$/u.test(value))).toStrictEqual([]);
});

// `applyToEnvironment` is the whole reason `sitemap.xml` does not also land in the
// SSR bundle, and a client-only build cannot tell that guard from its absence.
it('emits nothing outside the client environment', async () => {
  expect(await emittedForSsr('sitemap')).toStrictEqual([]);
});
