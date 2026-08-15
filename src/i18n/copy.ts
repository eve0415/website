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

interface SiteCopy {
  navAria: string;
  langAria: string;
  navHome: string;
  navProjects: string;
  navSkills: string;
  navLinks: string;
  navAbout: string;
}

/** Chrome shared by every page: the header nav and the language switch. */
export const SITE_COPY = {
  ja: {
    navAria: 'メニュー',
    langAria: '言語',
    navHome: 'ホーム',
    navProjects: '作ったもの',
    navSkills: 'できること',
    navLinks: 'つながる',
    navAbout: 'About',
  },
  en: {
    navAria: 'Menu',
    langAria: 'Language',
    navHome: 'Home',
    navProjects: 'Works',
    navSkills: 'Skills',
    navLinks: 'Contact',
    navAbout: 'About',
  },
} satisfies Record<Locale, SiteCopy>;

interface HomeCopy {
  greeting: string;
  heroSub1: string;
  heroSub2: string;
  ctaProjects: string;
  ctaHire: string;
  homeHighlights: string;
  hlIfDesc: string;
  hlIfStat: string;
  hlCellaDesc: string;
  alphaNow: string;
  seeAll: string;
  altCat: string;
}

/**
 * The greeting is one of fifteen lines in the design, picked by hour and then
 * at random. The sky renders at midnight and the page is prerendered, so the
 * hour bucket is fixed and the random pick has to be too — this is the first
 * line of the midnight set.
 */
export const HOME_COPY = {
  ja: {
    greeting: 'こんばんは。夜更かし仲間ですね。',
    heroSub1: '広く浅く技術を嗜むプロダクトエンジニア。',
    heroSub2: '新しい技術はとりあえず試す派です。',
    ctaProjects: '作ったものを見る',
    ctaHire: 'お仕事を依頼する',
    homeHighlights: 'ハイライト',
    hlIfDesc: 'サポートが終わった Industrial Foregoing の既知バグを直す Minecraft パッチMod。',
    hlIfStat: '累計 930,000+ ダウンロード',
    hlCellaDesc: 'ターミナルだけで完結する Rust 製の devcontainer CLI。',
    alphaNow: 'alpha 公開中',
    seeAll: '全部見る',
    altCat: 'オッドアイの黒猫のイラスト(AI生成)',
  },
  en: {
    greeting: 'Good evening. Fellow night owl, I see.',
    heroSub1: 'Product engineer who dabbles in a bit of everything.',
    heroSub2: "If it's new, I've probably already tried it.",
    ctaProjects: "See what I've built",
    ctaHire: 'Hire me',
    homeHighlights: 'Highlights',
    hlIfDesc: "A Minecraft patch mod that keeps fixing Industrial Foregoing's known bugs long after upstream stopped caring.",
    hlIfStat: '930,000+ downloads and counting',
    hlCellaDesc: 'A devcontainer CLI in Rust that never makes you leave the terminal.',
    alphaNow: 'now in alpha',
    seeAll: 'See them all',
    altCat: 'An odd-eyed black cat illustration (AI-generated)',
  },
} satisfies Record<Locale, HomeCopy>;

interface NotFoundCopy {
  docTitle: string;
  title: string;
  lede1: string;
  lede2: string;
  btnHome: string;
  btnProjects: string;
  btnSearch: string;
  btnSearching: string;
  btnDone: string;
  resultFinal: string;
  foundLabel: string;
  items: readonly [string, string, string, string, string, string];
  meows: readonly [string, string, string];
  altCat: string;
  catAria: string;
  /** "still no page, here is what the cat brought back instead" */
  rescued: (item: string) => string;
}

export const NOT_FOUND_COPY = {
  ja: {
    docTitle: '404 — ページが見つかりません | eve0415.net',
    title: 'ページが見つかりません',
    lede1: 'このURLは星図に載っていないようです。',
    lede2: 'たぶん、雲の下に落ちました。流れ星にも心当たりはないそうです。',
    btnHome: 'ホームに戻る',
    btnProjects: '作ったものを見る',
    btnSearch: 'このへんを捜索する',
    btnSearching: '捜索中……',
    btnDone: '捜索範囲外です',
    resultFinal: 'この空にはもう何もないようです。そろそろ帰りましょう。',
    foundLabel: '保護したもの',
    items: ['靴下(片方)', '消し忘れの console.log', '未完の TODO リスト', '使っていないドメイン', '賞味期限切れの Cookie', '猫の毛玉'],
    meows: ['にゃーん。', 'にゃ。(ページのことは知らないそうです)', '……にゃ。(そろそろ帰りたいそうです)'],
    altCat: '雲の上で捜索を手伝ってくれる黒猫のマスコット(AI生成)',
    catAria: '猫に話しかける',
    rescued: item => `ページは見つかりませんでした。かわりに「${item}」を保護しました。`,
  },
  en: {
    docTitle: '404 — Page not found | eve0415.net',
    title: 'Page not found',
    lede1: 'This URL is not on the star chart.',
    lede2: 'It probably fell below the clouds. The shooting stars say they have not seen it either.',
    btnHome: 'Back home',
    btnProjects: 'See my work',
    btnSearch: 'Search around here',
    btnSearching: 'Searching……',
    btnDone: 'Out of search range',
    resultFinal: 'Nothing else up here, it seems. Time to head home.',
    foundLabel: 'Rescued so far',
    items: ['a sock (just one)', 'a forgotten console.log', 'an unfinished TODO list', 'an unused domain', 'an expired cookie', 'a hairball'],
    meows: ['Meow.', 'Mew. (No idea about the page, apparently.)', '……Meow. (Ready to go home, apparently.)'],
    altCat: 'The black cat mascot helping with the search above the clouds (AI-generated)',
    catAria: 'Talk to the cat',
    rescued: item => `Still no page. Rescued "${item}" instead.`,
  },
} satisfies Record<Locale, NotFoundCopy>;
