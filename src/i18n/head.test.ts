import type { RoutePath } from '#i18n/copy';
import type { Locale } from '#i18n/locale';

import { describe, expect, it } from 'vitest';

import { SITE_URL, canonicalUrl, localeHead } from '#i18n/head';
import { LOCALES } from '#i18n/locale';

/** Flattened so a union of link shapes can be filtered without narrowing at every use. */
const linksOf = (locale: Locale, path: RoutePath) =>
  localeHead(locale, path).links.map(link => ({
    rel: link.rel,
    hrefLang: 'hrefLang' in link ? link.hrefLang : '',
    href: link.href,
  }));

const metaOf = (locale: Locale, path: RoutePath) =>
  localeHead(locale, path).meta.map(entry => ({
    property: 'property' in entry ? entry.property : '',
    content: 'content' in entry ? entry.content : '',
  }));

const contentOf = (locale: Locale, path: RoutePath, property: string): string[] =>
  metaOf(locale, path)
    .filter(entry => entry.property === property)
    .map(entry => entry.content);

const OTHER_OG = { ja: 'en_US', en: 'ja_JP' } satisfies Record<Locale, string>;
const OWN_OG = { ja: 'ja_JP', en: 'en_US' } satisfies Record<Locale, string>;

describe('canonicalUrl', () => {
  it.each([
    ['ja', '/', `${SITE_URL}/`],
    ['ja', '/about', `${SITE_URL}/about`],
    // No trailing slash on the English root.
    ['en', '/', `${SITE_URL}/en`],
    ['en', '/about', `${SITE_URL}/en/about`],
  ] as const)('builds %s %s as %s', (locale, path, url) => {
    expect(canonicalUrl(locale, path)).toBe(url);
  });
});

describe('localeHead links', () => {
  it.each(LOCALES)('emits exactly one canonical for %s, because matches concatenate without de-duplication', locale => {
    expect(linksOf(locale, '/about').filter(link => link.rel === 'canonical')).toHaveLength(1);
  });

  it.each(LOCALES)('points %s at its own URL rather than the Japanese one', locale => {
    const canonical = linksOf(locale, '/about').filter(link => link.rel === 'canonical');

    expect(canonical.map(link => link.href)).toStrictEqual([canonicalUrl(locale, '/about')]);
  });

  it.each(LOCALES)('lists both locales in the hreflang cluster from %s, including itself', locale => {
    const alternates = linksOf(locale, '/about').filter(link => link.rel === 'alternate' && link.hrefLang !== 'x-default');

    expect(alternates).toStrictEqual(LOCALES.map(alternate => ({ rel: 'alternate', hrefLang: alternate, href: canonicalUrl(alternate, '/about') })));
  });

  it.each(LOCALES)('emits exactly one x-default from %s, pointing at the Japanese URL', locale => {
    const fallback = linksOf(locale, '/about').filter(link => link.hrefLang === 'x-default');

    expect(fallback).toStrictEqual([{ rel: 'alternate', hrefLang: 'x-default', href: canonicalUrl('ja', '/about') }]);
  });
});

describe('localeHead meta', () => {
  it.each(LOCALES)('gives %s an og:url equal to its canonical', locale => {
    expect(contentOf(locale, '/about', 'og:url')).toStrictEqual([canonicalUrl(locale, '/about')]);
  });

  it.each(LOCALES)('maps %s to its Open Graph locale', locale => {
    expect(contentOf(locale, '/about', 'og:locale')).toStrictEqual([OWN_OG[locale]]);
  });

  it.each(LOCALES)('lists exactly one og:locale:alternate from %s, and it is the other locale', locale => {
    expect(contentOf(locale, '/about', 'og:locale:alternate')).toStrictEqual([OTHER_OG[locale]]);
  });

  it.each(LOCALES)('carries the localised title and description for %s', locale => {
    const titles = contentOf(locale, '/about', 'og:title');
    const descriptions = contentOf(locale, '/about', 'og:description');

    expect({ titles: titles.length, descriptions: descriptions.length, titled: titles.every(title => title.length > 0) }).toStrictEqual({
      titles: 1,
      descriptions: 1,
      titled: true,
    });
  });
});
