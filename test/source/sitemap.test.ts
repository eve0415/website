import { beforeAll, expect, it } from 'vitest';

import { PAGES } from '../pages';

import { emitted } from './plugin-harness';

/**
 * `vite.config.ts`'s `sitemap()` plugin, driven through a real build rather than
 * read back off `dist/`: `sitemapXml` and the two namespace constants are locals
 * of that file, and the exported config is the only way in that does not add an
 * export.
 */
let sitemap = '';

// In `beforeAll` rather than at module scope: a build that throws during
// collection turns these four tests into none rather than into red ones.
beforeAll(async () => {
  const assets = await emitted('sitemap');
  const source = assets.get('sitemap.xml');
  if (source === undefined) throw new Error(`the sitemap plugin emitted ${[...assets.keys()].join(', ') || 'nothing'}`);

  sitemap = source;
});

const textIn = (tag: string): string[] => [...sitemap.matchAll(new RegExp(String.raw`<${tag}>([^<]*)</${tag}>`, 'gu'))].map(([, text = '']) => text);

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
it('declares the sitemap namespace in the spelling the protocol defines', () => {
  expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">');
});

it('lists every locale of every route exactly once', () => {
  expect(textIn('loc').toSorted()).toStrictEqual(PAGES.map(page => page.url).toSorted());
});

// Sorted on both sides: the sitemap's entry order comes from `ROUTE_SET` in
// vite.config.ts and `PAGES`'s from the transcribed table, and nothing holds
// those two orders together. The order that matters is the one inside each cluster.
const byLoc = (a: Entry, b: Entry): number => a.loc.localeCompare(b.loc);

it('gives every entry the whole hreflang cluster for its route', () => {
  const entries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/gu)].map(([, block = '']) => entryOf(block));

  expect(entries.toSorted(byLoc)).toStrictEqual(PAGES.map(({ url, alternates }): Entry => ({ loc: url, alternates })).toSorted(byLoc));
});

// Shape only. The value is `new Date()` at build time, so asserting it would
// either re-derive the clock the plugin read or pin a date that goes stale.
it('stamps every entry with a date-shaped lastmod', () => {
  const lastmods = textIn('lastmod');

  expect(lastmods).toHaveLength(PAGES.length);
  expect(lastmods.filter(value => !/^\d{4}-\d{2}-\d{2}$/u.test(value))).toStrictEqual([]);
});
