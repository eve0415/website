import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, LOCALES, localeFromPathname, localeParams, localePath, parseLocaleParam } from '#i18n/locale';

describe('LOCALES', () => {
  it('serves Japanese unprefixed', () => {
    expect({ locales: [...LOCALES], fallback: DEFAULT_LOCALE }).toStrictEqual({ locales: ['ja', 'en'], fallback: 'ja' });
  });
});

describe('parseLocaleParam', () => {
  it.each([
    ['an absent segment', undefined, DEFAULT_LOCALE],
    ['the English segment', 'en', 'en'],
    // A miss, not a fallback: `/ja/...` would serve Japanese at a second,
    // non-canonical URL, and `{-$locale}` would swallow the segment.
    ['an explicit ja segment', 'ja', undefined],
    ['an unknown segment', 'fr', undefined],
    ['an empty segment', '', undefined],
    ['a path-shaped segment', 'en/about', undefined],
    // Exact match, the same rule localeFromPathname follows. Case-folded or
    // trimmed here, /EN/about renders English while the root's beforeLoad
    // computed ja — English copy under a ja document lang, at a second URL.
    ['an uppercase segment', 'EN', undefined],
    ['a mixed-case segment', 'En', undefined],
    ['a leading-space segment', ' en', undefined],
    ['a trailing-space segment', 'en ', undefined],
    ['an uppercase ja segment', 'JA', undefined],
  ])('resolves %s', (_label, param, locale) => {
    expect(parseLocaleParam(param)).toBe(locale);
  });
});

describe('localeFromPathname', () => {
  it.each([
    ['/en', 'en'],
    ['/en/', 'en'],
    ['/en/about', 'en'],
    ['/en/projects/cella', 'en'],
    ['/', DEFAULT_LOCALE],
    ['/about', DEFAULT_LOCALE],
    // The prefix trap: `/en` has to match exactly or as a path segment, or every
    // route starting with those two letters is read as English.
    ['/english', DEFAULT_LOCALE],
    ['/entrance', DEFAULT_LOCALE],
    ['/enter/about', DEFAULT_LOCALE],
    // Exact match, so casing is not a locale.
    ['/EN', DEFAULT_LOCALE],
    ['/En/about', DEFAULT_LOCALE],
  ])('reads %s as %s', (pathname, locale) => {
    expect(localeFromPathname(pathname)).toBe(locale);
  });
});

describe('localePath', () => {
  it.each([
    ['ja', '/', '/'],
    ['ja', '/about', '/about'],
    // No trailing slash: the Cloudflare asset server 307s `/en/` to `/en`, so a
    // canonical built the other way would point at a redirect.
    ['en', '/', '/en'],
    ['en', '/about', '/en/about'],
    ['en', '/projects/cella', '/en/projects/cella'],
  ] as const)('builds %s %s as %s', (locale, path, built) => {
    expect(localePath(locale, path)).toBe(built);
  });
});

describe('localeParams', () => {
  it.each([
    ['en', { locale: 'en' }],
    ['ja', { locale: undefined }],
  ] as const)('gives %s the segment %o', (locale, params) => {
    expect(localeParams(locale)).toStrictEqual(params);
  });
});
