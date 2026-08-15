import type { RoutePath } from '#i18n/copy';
import type { Locale } from '#i18n/locale';

import { PAGE_COPY } from '#i18n/copy';
import { DEFAULT_LOCALE, LOCALES, localePath } from '#i18n/locale';

export const SITE_URL = 'https://eve0415.net';

const OG_LOCALE = { ja: 'ja_JP', en: 'en_US' } satisfies Record<Locale, string>;

export const canonicalUrl = (locale: Locale, path: RoutePath): string => `${SITE_URL}${localePath(locale, path)}`;

/**
 * Per-locale canonical and hreflang for one route.
 *
 * The canonical is self-referential — pointing English at the Japanese URL
 * would drop English out of the index. The hreflang set is self-referential
 * too: a page has to list itself or the whole cluster is ignored.
 *
 * Must not be merged into the root route: matches contribute `links` by
 * concatenation with no de-duplication, so a root-level canonical ships
 * alongside this one rather than being overridden by it.
 */
export const localeHead = (locale: Locale, path: RoutePath) => ({
  meta: [
    { title: PAGE_COPY[locale][path].title },
    { name: 'description', content: PAGE_COPY[locale][path].description },
    { property: 'og:title', content: PAGE_COPY[locale][path].title },
    { property: 'og:description', content: PAGE_COPY[locale][path].description },
    { name: 'twitter:title', content: PAGE_COPY[locale][path].title },
    { name: 'twitter:description', content: PAGE_COPY[locale][path].description },
    { property: 'og:url', content: canonicalUrl(locale, path) },
    { property: 'og:locale', content: OG_LOCALE[locale] },
    ...LOCALES.filter(alternate => alternate !== locale).map(alternate => ({
      property: 'og:locale:alternate',
      content: OG_LOCALE[alternate],
    })),
  ],
  links: [
    { rel: 'canonical', href: canonicalUrl(locale, path) },
    ...LOCALES.map(alternate => ({ rel: 'alternate', hrefLang: alternate, href: canonicalUrl(alternate, path) })),
    { rel: 'alternate', hrefLang: 'x-default', href: canonicalUrl(DEFAULT_LOCALE, path) },
  ],
});
