import type { RoutePath } from '#i18n/copy';
import type { Locale } from '#i18n/locale';

import { describe, expect, it } from 'vitest';

import { PAGE_COPY } from '#i18n/copy';
import { SITE_URL, canonicalUrl, localeHead } from '#i18n/head';
import { LOCALES } from '#i18n/locale';

/**
 * More than one route, because `path` reaching the output is most of what this
 * module does: wired to a constant instead, every one of the 20 prerendered pages
 * declares itself a duplicate of that one route. `/` is included because that is
 * where `localePath`'s trailing-slash ternary applies.
 */
const PATHS = ['/', '/about', '/projects/cella'] as const satisfies readonly RoutePath[];

const CASES: [Locale, RoutePath][] = LOCALES.flatMap(locale => PATHS.map((path): [Locale, RoutePath] => [locale, path]));

/** Flattened so a union of shapes can be compared as one array. */
const metaOf = (locale: Locale, path: RoutePath) =>
  localeHead(locale, path).meta.map(entry => ({
    title: 'title' in entry ? entry.title : '',
    name: 'name' in entry ? entry.name : '',
    property: 'property' in entry ? entry.property : '',
    content: 'content' in entry ? entry.content : '',
  }));

const linksOf = (locale: Locale, path: RoutePath) =>
  localeHead(locale, path).links.map(link => ({
    rel: link.rel,
    hrefLang: 'hrefLang' in link ? link.hrefLang : '',
    href: link.href,
  }));

const contentOf = (locale: Locale, path: RoutePath, property: string): string[] =>
  metaOf(locale, path)
    .filter(entry => entry.property === property)
    .map(entry => entry.content);

const OG = { ja: 'ja_JP', en: 'en_US' } satisfies Record<Locale, string>;
const OTHER_OG = { ja: 'en_US', en: 'ja_JP' } satisfies Record<Locale, string>;

describe('SITE_URL', () => {
  it('is the site origin every canonical, og:url and hreflang is built from', () => {
    expect(SITE_URL).toBe('https://eve0415.net');
  });
});

describe('canonicalUrl', () => {
  it.each([
    ['ja', '/', 'https://eve0415.net/'],
    ['ja', '/about', 'https://eve0415.net/about'],
    ['ja', '/projects/cella', 'https://eve0415.net/projects/cella'],
    // No trailing slash on the English root.
    ['en', '/', 'https://eve0415.net/en'],
    ['en', '/about', 'https://eve0415.net/en/about'],
    ['en', '/projects/cella', 'https://eve0415.net/en/projects/cella'],
  ] as const)('builds %s %s as %s', (locale, path, url) => {
    expect(canonicalUrl(locale, path)).toBe(url);
  });
});

describe('localeHead links', () => {
  it.each(CASES)('emits exactly one canonical, both alternates and one x-default for %s %s', (locale, path) => {
    expect(linksOf(locale, path)).toStrictEqual([
      { rel: 'canonical', hrefLang: '', href: canonicalUrl(locale, path) },
      { rel: 'alternate', hrefLang: 'ja', href: canonicalUrl('ja', path) },
      { rel: 'alternate', hrefLang: 'en', href: canonicalUrl('en', path) },
      { rel: 'alternate', hrefLang: 'x-default', href: canonicalUrl('ja', path) },
    ]);
  });

  it.each(CASES)('emits one canonical only for %s %s, because matches concatenate without de-duplication', (locale, path) => {
    expect(linksOf(locale, path).filter(link => link.rel === 'canonical')).toHaveLength(1);
  });

  it.each(CASES)('points the canonical for %s %s at its own URL rather than the Japanese one', (locale, path) => {
    expect(
      linksOf(locale, path)
        .filter(link => link.rel === 'canonical')
        .map(link => link.href),
    ).toStrictEqual([canonicalUrl(locale, path)]);
  });
});

describe('localeHead meta', () => {
  it.each(CASES)('emits exactly this meta set for %s %s', (locale, path) => {
    const copy = PAGE_COPY[locale][path];

    expect(metaOf(locale, path)).toStrictEqual([
      { title: copy.title, name: '', property: '', content: '' },
      { title: '', name: 'description', property: '', content: copy.description },
      { title: '', name: '', property: 'og:title', content: copy.title },
      { title: '', name: '', property: 'og:description', content: copy.description },
      { title: '', name: 'twitter:title', property: '', content: copy.title },
      { title: '', name: 'twitter:description', property: '', content: copy.description },
      { title: '', name: '', property: 'og:url', content: canonicalUrl(locale, path) },
      { title: '', name: '', property: 'og:locale', content: OG[locale] },
      { title: '', name: '', property: 'og:locale:alternate', content: OTHER_OG[locale] },
    ]);
  });

  it.each(CASES)('carries the copy written for %s %s, not another route or another locale', (locale, path) => {
    const copy = PAGE_COPY[locale][path];

    expect({ title: contentOf(locale, path, 'og:title'), description: contentOf(locale, path, 'og:description') }).toStrictEqual({
      title: [copy.title],
      description: [copy.description],
    });
  });

  it.each(CASES)('gives %s %s an og:url equal to its canonical', (locale, path) => {
    expect(contentOf(locale, path, 'og:url')).toStrictEqual([canonicalUrl(locale, path)]);
  });

  it.each(CASES)('lists exactly one og:locale:alternate for %s %s, and it is the other locale', (locale, path) => {
    expect({ own: contentOf(locale, path, 'og:locale'), alternate: contentOf(locale, path, 'og:locale:alternate') }).toStrictEqual({
      own: [OG[locale]],
      alternate: [OTHER_OG[locale]],
    });
  });
});
