export const LOCALES = ['ja', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

/** Japanese is served unprefixed, so `/projects` is the canonical Japanese URL. */
export const DEFAULT_LOCALE: Locale = 'ja';

/**
 * Resolves the `{-$locale}` path segment.
 *
 * The segment is absent for Japanese and `en` for English. Anything else is a
 * miss rather than a fallback: `{-$locale}` would otherwise swallow an unknown
 * first segment and quietly render the home page at it, and `/ja/...` would
 * serve Japanese at a second, non-canonical URL.
 */
export const parseLocaleParam = (param: string | undefined): Locale | undefined => (param === undefined ? DEFAULT_LOCALE : param === 'en' ? 'en' : undefined);

/** Builds a path for a locale: Japanese unprefixed, English under `/en`. */
export const localePath = (locale: Locale, path: string): string => (locale === DEFAULT_LOCALE ? path : `/en${path === '/' ? '' : path}`);
