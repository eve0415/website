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

/**
 * Resolves the locale from a pathname.
 *
 * The root route sits above the `{-$locale}` segment, so its `beforeLoad` has
 * no `locale` param to read — but it does get the location, and running this
 * there computes the locale once, on the server during SSR, for everything
 * below it. Validation of the segment stays on the `{-$locale}` route.
 */
export const localeFromPathname = (pathname: string): Locale => (pathname === '/en' || pathname.startsWith('/en/') ? 'en' : DEFAULT_LOCALE);

/** Builds a path for a locale: Japanese unprefixed, English under `/en`. */
export const localePath = (locale: Locale, path: string): string => (locale === DEFAULT_LOCALE ? path : `/en${path === '/' ? '' : path}`);

/**
 * The `{-$locale}` segment for a router link's `params`, the same rule as
 * `localePath` in the shape `Link` wants: Japanese is the unprefixed locale, so
 * its segment is absent rather than `ja`. The literal has to survive inference —
 * widened to `string`, the router rejects it.
 */
export const localeParams = (locale: Locale) => ({ locale: locale === 'en' ? ('en' as const) : undefined });
