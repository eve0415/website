import type { Page } from './client-output';

import { expect, it } from 'vitest';

import { DEFAULT_LOCALE, LOCALES } from '#i18n/locale';

import { PAGES, pageUrl, read } from './client-output';

const SITEMAP = read('sitemap.xml');

const textIn = (tag: string): string[] => [...SITEMAP.matchAll(new RegExp(String.raw`<${tag}>([^<]*)</${tag}>`, 'gu'))].map(([, text = '']) => text);

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

const expected = (page: Page): Entry => ({
  loc: page.url,
  alternates: [...LOCALES.map((locale): [string, string] => [locale, pageUrl(locale, page.route)]), ['x-default', pageUrl(DEFAULT_LOCALE, page.route)]],
});

/**
 * The scheme is part of the namespace name and namespaces match as exact
 * strings, so the `https` spelling — which the generator this replaces hardcodes
 * — is a different namespace, not a variant spelling of this one.
 */
it('declares the sitemap namespace in the spelling the protocol defines', () => {
  expect(SITEMAP).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">');
});

it('lists every locale of every route exactly once', () => {
  expect(textIn('loc').toSorted()).toStrictEqual(PAGES.map(page => page.url).toSorted());
});

it('gives every entry the whole hreflang cluster for its route', () => {
  expect([...SITEMAP.matchAll(/<url>([\s\S]*?)<\/url>/gu)].map(([, block = '']) => entryOf(block))).toStrictEqual(PAGES.map(page => expected(page)));
});

it('stamps every entry with a date-shaped lastmod', () => {
  const lastmods = textIn('lastmod');

  expect(lastmods).toHaveLength(PAGES.length);
  expect(lastmods.filter(value => !/^\d{4}-\d{2}-\d{2}$/u.test(value))).toStrictEqual([]);
});
