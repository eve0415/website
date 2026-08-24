import { expect, it } from 'vitest';

import { PAGES, read } from './client-output';

const SITEMAP = read('sitemap.xml');

const textIn = (tag: string): string[] => [...SITEMAP.matchAll(new RegExp(String.raw`<${tag}>([^<]*)</${tag}>`, 'gu'))].map(([, text = '']) => text);

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

it('stamps every entry with a date-shaped lastmod', () => {
  const lastmods = textIn('lastmod');

  expect(lastmods).toHaveLength(PAGES.length);
  expect(lastmods.filter(value => !/^\d{4}-\d{2}-\d{2}$/u.test(value))).toStrictEqual([]);
});
