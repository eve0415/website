import type { Locale } from '#i18n/locale';

/** Routes with their own copy. Grows as pages land. */
export type RoutePath = '/';

interface PageCopy {
  title: string;
  description: string;
}

/**
 * Verbatim from the design; both locales are authored, not translated at
 * runtime. Keyed by locale then path so a missing page is a compile error.
 */
export const PAGE_COPY = {
  ja: {
    '/': {
      title: 'eve0415.net — 雲の上より',
      description: '広く浅く技術を嗜むプロダクトエンジニア。新しい技術はとりあえず試す派です。',
    },
  },
  en: {
    '/': {
      title: 'eve0415.net — live from above the clouds',
      description: "Product engineer who dabbles in a bit of everything. If it's new, I've probably already tried it.",
    },
  },
} satisfies Record<Locale, Record<RoutePath, PageCopy>>;
