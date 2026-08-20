import type { Locale } from '#i18n/locale';

/** Routes with their own copy. Grows as pages land. */
export type RoutePath =
  | '/'
  | '/projects'
  | '/projects/ifpatcher'
  | '/projects/cella'
  | '/projects/oasts'
  | '/projects/dotclaude'
  | '/projects/website'
  | '/skills'
  | '/links'
  | '/about';

interface PageCopy {
  title: string;
  description: string;
}

interface SiteCopy {
  navAria: string;
  langAria: string;
  navHome: string;
  navProjects: string;
  navSkills: string;
  navLinks: string;
  navAbout: string;
  /** Dismisses the opening curtain. */
  skip: string;
  /** The bypass link: eight identical chrome stops sit in front of `<main>`. */
  skipToContent: string;
  /** Footer dwell line, read as `${dwellPrefix} ${duration}`. */
  dwellPrefix: string;
  /**
   * Units for the dwell duration where `Intl.DurationFormat` is missing. Both
   * halves read as `${count} ${unit}`, and the hours half is dropped under an
   * hour.
   */
  dwellHours: string;
  dwellMinutes: string;
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
    skip: 'スキップ',
    skipToContent: '本文へスキップ',
    dwellPrefix: 'ここに来てから',
    dwellHours: '時間',
    dwellMinutes: '分',
  },
  en: {
    navAria: 'Menu',
    langAria: 'Language',
    navHome: 'Home',
    navProjects: 'Works',
    navSkills: 'Skills',
    navLinks: 'Contact',
    navAbout: 'About',
    skip: 'Skip',
    skipToContent: 'Skip to content',
    dwellPrefix: 'Here for',
    dwellHours: 'hr',
    dwellMinutes: 'min',
  },
} satisfies Record<Locale, SiteCopy>;

/** The three interchangeable lines for one hour bucket. */
type GreetingSet = readonly [string, string, string];

/** 朝 / 昼 / 夕 / 夜 / 深夜, in the order `bucketFor` returns. */
export type Greetings = readonly [GreetingSet, GreetingSet, GreetingSet, GreetingSet, GreetingSet];

interface HomeCopy {
  greetings: Greetings;
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
 * The greeting is one of fifteen lines, picked by the hour and then at random.
 * Prerendering can do neither, so every page ships the first line of the 深夜
 * set — the design's canonical state, matching the midnight sky — and `Greeting`
 * swaps it for the visitor's own hour once it is running.
 */
export const HOME_COPY = {
  ja: {
    greetings: [
      ['おはようございます。早起き、尊敬します。', 'おはようございます。私はたぶんまだ寝ています。', 'おはようございます。朝の空は新鮮です。'],
      ['こんにちは。明るい時間にようこそ。', 'こんにちは。休憩中でしょうか。', 'こんにちは。珍しい時間にお会いしますね。'],
      ['こんばんは。そろそろ夜が始まります。', 'こんばんは。おつかれさまです。', 'こんばんは。いい時間になってきました。'],
      ['こんばんは。ここからが本番です。', 'こんばんは。夜はまだ長いです。', 'こんばんは。ゆっくりしていってください。'],
      ['こんばんは。夜更かし仲間ですね。', 'こんばんは。お互い、まだ起きていますね。', 'こんばんは。静かでいい時間です。'],
    ],
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
    greetings: [
      ['Good morning. Respect for being up this early.', "Good morning. I'm probably still asleep.", 'Good morning. The morning sky is a rare sight for me.'],
      ['Hello. You caught me in daylight.', 'Hello. A rare daytime visit.', 'Hello. Welcome, while the sun is still up.'],
      ['Good evening. The night is just getting started.', 'Good evening. Hope the day went easy on you.', 'Good evening. Getting to the good hours.'],
      ['Good evening. Now the real hours begin.', 'Good evening. The night is still young.', 'Good evening. Make yourself at home.'],
      ['Good evening. Fellow night owl, I see.', 'Good evening. Still up, both of us.', 'Good evening. Quiet hours are the best hours.'],
    ],
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
    altCat: '捜索を手伝ってくれる黒猫のマスコット(AI生成)',
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

interface WorksCopy {
  title: string;
  intro: string;
  ifDesc: string;
  details: string;
  dlTotal: string;
  cellaDesc: string;
  oastsDesc: string;
  dcDesc: string;
  siteDesc: string;
  seeHistory: string;
  ghAll: string;
}

/** The 作ったもの index. */
export const WORKS_COPY = {
  ja: {
    title: '作ったもの',
    intro: '公開リポジトリは 67 個。ここでは代表的なものを紹介しています。',
    ifDesc: 'サポート終了後の Industrial Foregoing(Minecraft 1.12.2)の既知バグを ASM で修正するパッチMod。Tekkit 2 にも同梱。',
    details: '詳しく →',
    dlTotal: '累計ダウンロード',
    cellaDesc: 'ターミナルネイティブな devcontainer CLI。公式CLIが実装していないポート転送や認証転送を、Node 不要の単一バイナリで実装。',
    oastsDesc: 'OpenAPI 3.0/3.1 から TypeScript を生成するコンパイラ。失敗も含めて全部に型が付き、出力はバイト単位で決定的。本体は Rust 製。',
    dcDesc: '~/.claude をブラウザで開き、セッション・ツール呼び出し・トークン消費を可視化するダッシュボード。データは端末の外に出ません。',
    siteDesc: 'このサイト。2022年の公開から4回作り直してきた変遷を、年表にまとめています。',
    seeHistory: '歴史を見る →',
    ghAll: 'GitHub で全部見る',
  },
  en: {
    title: 'Works',
    intro: '67 public repos. These are the highlights.',
    ifDesc: "The mod died, the bugs didn't. ASM bytecode patches for Industrial Foregoing (Minecraft 1.12.2), post-EOL. Ships inside Tekkit 2.",
    details: 'More →',
    dlTotal: 'Total downloads',
    cellaDesc: 'A terminal-native devcontainer CLI. All the forwarding the official CLI never shipped — ports, creds — in one binary, zero Node.',
    oastsDesc: 'OpenAPI 3.0/3.1 in, TypeScript out. Every outcome is typed — even the failures — and the output is deterministic to the byte. Core in Rust.',
    dcDesc: 'Opens ~/.claude in your browser: sessions, tool calls, token burn. Your data never phones home.',
    siteDesc: 'This site. Torn down and rebuilt four times since 2022 — the full story is on the timeline.',
    seeHistory: 'See the lore →',
    ghAll: "Everything's on GitHub",
  },
} satisfies Record<Locale, WorksCopy>;

interface ProjectChromeCopy {
  backWorks: string;
  linksHead: string;
  /** Shown in the terminal panel once the command is on the clipboard. */
  copied: string;
  /** The terminal panel's own button, before and after the copy. */
  btnCopy: string;
  btnCopied: string;
}

/** Shared by every project detail page. */
export const PROJECT_COPY = {
  ja: {
    backWorks: '← 作ったもの',
    linksHead: 'リンク',
    copied: 'クリップボードにコピーしました',
    btnCopy: 'コピー',
    btnCopied: 'コピー済み',
  },
  en: {
    backWorks: '← Back to Works',
    linksHead: 'Links',
    copied: 'Copied to clipboard',
    btnCopy: 'copy',
    btnCopied: 'copied',
  },
} satisfies Record<Locale, ProjectChromeCopy>;

interface IfPatcherCopy {
  lede: string;
  dlTotal: string;
  version: string;
  tekkit: string;
  fixHead: string;
  fixBody: string;
}

export const IFPATCHER_COPY = {
  ja: {
    lede: 'サポート終了(EOL)となった Industrial Foregoing(Minecraft 1.12.2)向けの非公式パッチMod。ASM でバイトコードを直接書き換え、既知のバグ修正といくつかの機能追加を行います。',
    dlTotal: '累計ダウンロード',
    version: '対応 Minecraft バージョン',
    tekkit: 'Technic モドパックに同梱',
    fixHead: '直したもの(一部)',
    fixBody:
      '搬入コンベアアップグレードのアイテム増殖。ネガティブレンズ使用時の Laser Base クラッシュ。ネザーウォート以外から始まるポーションの醸造。どんなブロックでも耕せる Plant Sower。他のバグも報告があれば対応します。',
  },
  en: {
    lede: "An unofficial patch mod for Industrial Foregoing (Minecraft 1.12.2) after it hit end-of-life. It rewrites the bytecode directly with ASM — squashing known bugs and sneaking in a few features while it's in there.",
    dlTotal: 'Total downloads',
    version: 'Minecraft version',
    tekkit: 'Ships in the Technic modpack',
    fixHead: 'What it fixes (the highlights)',
    fixBody:
      "Item duping via the insertion conveyor upgrade. Laser Base crashing the moment you tried a negative lens. Potions brewed from things that are very much not nether wart. A Plant Sower happily tilling literally any block. Got another one? File it and I'm on it.",
  },
} satisfies Record<Locale, IfPatcherCopy>;

interface CellaCopy {
  lede: string;
  status: string;
  crates: string;
  brewTitle: string;
  canHead: string;
  canBody: string;
  /** The GitHub Releases row: its label, then what is behind it. */
  releases: string;
  relBins: string;
}

export const CELLA_COPY = {
  ja: {
    lede: 'ターミナルネイティブな devcontainer CLI。Devcontainer 仕様に定義されていながら公式CLIが実装していない機能 — ポート転送、SSHエージェント転送、gh の認証情報転送、stop / down — を、Node.js 不要の単一バイナリで実装しています。',
    status: '公開ステータス',
    crates: 'Rust クレートで構成',
    brewTitle: 'Homebrew でインストール',
    canHead: 'できること(一部)',
    canBody:
      'ポート転送とブラウザ連携(OAuth コールバック)。SSH エージェントと gh 認証情報の転送。git worktree 連携 — ブランチごとに使い捨てコンテナ。Claude Code / Codex / Gemini CLI の設定転送。実際の認証情報をコンテナに置かないファントムトークン。対応ランタイムは Docker・OrbStack・Apple Container。',
    releases: 'リリース',
    relBins: 'macOS / Linux バイナリ ↗',
  },
  en: {
    lede: 'A terminal-native devcontainer CLI. Everything the Devcontainer spec promises but the official CLI never delivered — port forwarding, SSH agent forwarding, gh creds, stop / down — in a single binary — no Node.js required.',
    status: 'Status',
    crates: 'Rust crates in the workspace',
    brewTitle: 'Install with Homebrew',
    canHead: 'What it does (the highlights)',
    canBody:
      'Port forwarding with browser hooks (OAuth callbacks just work). SSH agent and gh credential forwarding. git worktree mode — a burner container per branch. Config forwarding for Claude Code / Codex / Gemini CLI. Phantom tokens, so real credentials never touch the container. Runs on Docker, OrbStack, and Apple Container.',
    releases: 'Releases',
    relBins: 'macOS / Linux binaries ↗',
  },
} satisfies Record<Locale, CellaCopy>;

interface OastsCopy {
  lede: string;
  stat1: string;
  stat1Label: string;
  stat2: string;
  stat2Label: string;
  stat3Label: string;
  pmAria: string;
  docs: string;
}

export const OASTS_COPY = {
  ja: {
    lede: 'OpenAPI 3.0/3.1 の定義から、TypeScript の型と依存ゼロの型付き fetch クライアントを生成するコンパイラ。2xx だけでなく、未定義のステータス・ネットワーク断・デコード失敗まで判別可能なユニオン型で返るので、switch 一つで全ケースを網羅できます。zod スキーマ、MSW ハンドラー、TanStack Query 用の記述子も生成します。',
    stat1: '約80ms',
    stat1Label: 'GitHub のフルスペック → 型生成',
    stat2: '決定的',
    stat2Label: '同じ入力からバイト単位で同じ出力(--check で CI ゲート)',
    stat3Label: '生成クライアントの実行時依存',
    pmAria: 'パッケージマネージャーを選ぶ',
    docs: 'ドキュメント',
  },
  en: {
    lede: 'A compiler that turns OpenAPI 3.0/3.1 into TypeScript types and a dependency-free typed fetch client. Responses come back as one discriminated union — 2xx, mystery statuses, dead connections, decode failures, all of it — so a single switch handles every case. Throws in zod schemas, MSW handlers, and TanStack Query descriptors for free.',
    stat1: '~80 ms',
    stat1Label: "GitHub's entire spec → types",
    stat2: 'Deterministic',
    stat2Label: 'Same input, same bytes, every time (--check gates CI)',
    stat3Label: 'Runtime deps in the generated client',
    pmAria: 'Choose a package manager',
    docs: 'Docs',
  },
} satisfies Record<Locale, OastsCopy>;

interface DotclaudeCopy {
  lede: string;
  privHead: string;
  privBody: string;
  try: string;
}

export const DOTCLAUDE_COPY = {
  ja: {
    lede: 'Claude Code が ~/.claude に残すデータをブラウザで開くダッシュボード。セッションの会話ログ、ツール呼び出し、サブエージェント、モデル別のトークン消費と推定コスト、メモリー、プロンプト履歴までまとめて見られます。',
    privHead: 'データはブラウザの外に出ません',
    privBody:
      'ファイルは File System Access API で読み、ブラウザ内の Web Worker で解析、描画まで全部クライアント側。サーバーが配るのはアプリ本体だけです。テレメトリなし、アナリティクスなし、Cookie なし。',
    try: '使ってみる',
  },
  en: {
    lede: 'Claude Code leaves a whole paper trail in ~/.claude. This opens it in your browser: session transcripts, tool calls, subagents, token burn and cost per model, memory, prompt history — the works.',
    privHead: 'Your data never leaves the browser',
    privBody:
      'Files come in through the File System Access API, get parsed in a Web Worker, and render — all client-side. The server ships the app and nothing else. No telemetry, no analytics, no cookies. Zero.',
    try: 'Try it',
  },
} satisfies Record<Locale, DotclaudeCopy>;

interface HistoryCopy {
  title: string;
  intro: string;
  v1Body: string;
  v2Title: string;
  v2Body: string;
  v3Title: string;
  v3Body: string;
  v4Title: string;
  v4Body: string;
  v5Title: string;
  v5Body: string;
  tagDS: string;
  prodSite: string;
}

/** v1's heading is the same in both locales, so it stays in the route. */
export const HISTORY_COPY = {
  ja: {
    title: 'eve0415.net の歴史',
    intro: '2022年の公開から5世代。その時々の流行を試してきた記録です。',
    v1Body:
      '学生時代に公開した初代。React 全盛で Next.js が事実上の標準だった頃です。バンドルサイズの削減と画像最適化に凝っていて、画像プロキシまで Cloudflare Workers + R2 で自作していました。',
    v2Title: 'v2 — Mantine に載せ替え',
    v2Body: 'UI ライブラリを MUI から、当時勢いよく伸びていた Mantine へ。フォントも刷新しました。骨格は Next.js のまま。',
    v3Title: 'v3 — Panda CSS で全面リニューアル',
    v3Body:
      '公開されたばかりのゼロランタイム CSS-in-JS、Panda CSS を採用して作り直し。ホスティングは Cloudflare Pages へ。同年11月には million.js でクライアント描画を高速化しました。2024年5月の更新を最後に、しばらく休眠。',
    v4Title: 'v4 — TanStack Start へ',
    v4Body:
      '約1年半ぶりの全面作り直し。Next.js をやめて TanStack Start + React 19(React Compiler) + Tailwind CSS 4、Cloudflare Workers 上で SSR という構成に。コミット履歴から AI がスキルを判定する機能や、BSOD 風のエラー画面などの実験も足しています。リンターは oxlint、フォーマッターは oxfmt。',
    v5Title: 'v5 — 夜空の再設計',
    v5Body:
      '夜空と雲海の世界観で再設計した5代目。いま見ているこのデザインです。技術を入れ替える回ではなく、見た目と言葉を決め直す回にしました。デザインは Claude Design で組み立てて、色・文字・余白・動きをトークンに落としてからコンポーネントとして積み上げています。',
    tagDS: 'デザインシステム',
    prodSite: '本番サイト',
  },
  en: {
    title: 'The lore of eve0415.net',
    intro: 'Five generations since 2022. A running log of chasing whatever was hot that year.',
    v1Body:
      'The OG, shipped back in my student days. Peak React era — Next.js was simply what you used. I was deep in the bundle-size and image-optimization rabbit hole, to the point of hand-rolling an image proxy on Cloudflare Workers + R2.',
    v2Title: 'v2 — The Mantine era',
    v2Body: 'Ditched MUI for Mantine while it was blowing up, refreshed the fonts, called it a day. Still Next.js underneath.',
    v3Title: 'v3 — The great Panda CSS rewrite',
    v3Body:
      'Rebuilt on Panda CSS, the zero-runtime CSS-in-JS that had just dropped. Hosting moved to Cloudflare Pages; million.js sped up client rendering that November. One last update in May 2024, then the site took a long nap.',
    v4Title: 'v4 — Enter TanStack Start',
    v4Body:
      'First full rebuild in a year and a half. Next.js out; TanStack Start + React 19 (React Compiler) + Tailwind CSS 4 in, SSR on Cloudflare Workers. Picked up some side quests too: AI grading my skills off commit history, a BSOD-style error screen. oxlint lints, oxfmt formats.',
    v5Title: 'v5 — The Night-Sky Redesign',
    v5Body:
      "Generation five, rebuilt around a night sky and a sea of clouds — the one you're looking at. This round wasn't a stack swap; it was about redeciding how the site looks and talks. Assembled in Claude Design: color, type, spacing, and motion boiled down to tokens, then stacked back up as components.",
    tagDS: 'Design system',
    prodSite: 'Live site',
  },
} satisfies Record<Locale, HistoryCopy>;

interface SkillsCopy {
  title: string;
  intro: string;
  legend: string;
  /** The same fact the legend states, for a reader who cannot see the outline. */
  dailyLabel: string;
  aiHead: string;
  aiBefore: string;
  aiAfter: string;
  chipMcp: string;
  groupLang: string;
  groupFe: string;
  groupBe: string;
  groupInfra: string;
  groupTest: string;
  chipBrew: string;
  note: string;
}

/** The できること page. Chip labels are product names, bar the two whose Japanese carries a qualifier its English does not need. */
export const SKILLS_COPY = {
  ja: {
    title: 'できること',
    intro: '広く浅く。深さについてはご相談ください。',
    legend: '明るい枠 = よく使っているもの',
    dailyLabel: '(よく使っているもの)',
    aiHead: 'AIエージェント',
    aiBefore: 'AI エージェントと並走するのがいまの作り方。',
    aiAfter: ' もそのために作りました。',
    chipMcp: 'MCP(ツール連携)',
    groupLang: '言語',
    groupFe: 'フロントエンド',
    groupBe: 'バックエンド・データベース',
    groupInfra: 'インフラ・運用',
    groupTest: 'テスト・ツールチェイン',
    chipBrew: 'Homebrew(tap運用)',
    note: '最新技術を追いかけるのが大好きです。気になったものはとりあえず試して、良かったものは本番にも持ち込みます。学びたいものはまだ尽きません。',
  },
  en: {
    title: 'Skills',
    intro: 'A mile wide, an inch deep. Depth negotiable.',
    legend: 'Bright outline = daily drivers',
    dailyLabel: '(daily driver)',
    aiHead: 'AI agents',
    aiBefore: 'Working alongside AI agents is how I build now. ',
    aiAfter: ' exists for exactly that.',
    chipMcp: 'MCP',
    groupLang: 'Languages',
    groupFe: 'Frontend',
    groupBe: 'Backend & databases',
    groupInfra: 'Infra & ops',
    groupTest: 'Testing & toolchain',
    chipBrew: 'Homebrew (own tap)',
    note: 'Chasing new tech is basically my hobby. Anything interesting gets a test drive, and the keepers make it to production. The to-learn list only gets longer.',
  },
} satisfies Record<Locale, SkillsCopy>;

interface ContactCopy {
  title: string;
  intro: string;
  xLabel: string;
  discordCopy: string;
  discordCopied: string;
  toastCopied: string;
  formHead: string;
  formIntro: string;
  fName: string;
  fEmail: string;
  fMessage: string;
  phName: string;
  phEmail: string;
  phMsg: string;
  submit: string;
  submitting: string;
  errName: string;
  errEmail: string;
  errMsg: string;
  /**
   * The design has no backend, so it authors only the three field errors. The
   * rest are the outcomes a real send can have, written in the same voice.
   */
  errTooLong: string;
  errChallenge: string;
  errRate: string;
  errSend: string;
  errPending: string;
  sentHead: string;
  sentBody: string;
  sendAnother: string;
  workHead: string;
  workBody: string;
}

/** The つながる page: the three rows, the contact form, and the 仕事 card. */
export const CONTACT_COPY = {
  ja: {
    title: 'つながる',
    intro: 'どこからでもどうぞ。だいたい夜に生息しています。',
    xLabel: 'X(旧Twitter)',
    discordCopy: 'IDをコピー',
    discordCopied: 'コピーしました',
    toastCopied: 'クリップボードにコピーしました',
    formHead: 'メッセージを送る',
    formIntro: 'このフォームから直接届きます。返信はメールアドレス宛にお送りします。',
    fName: '名前',
    fEmail: 'メールアドレス',
    fMessage: '本文',
    phName: 'お名前(ハンドルネームでも)',
    phEmail: 'you@example.com',
    phMsg: 'お仕事の相談、感想、雑談などなんでもどうぞ',
    submit: '送信する',
    submitting: '送信中…',
    errName: '名前を入力してください。',
    errEmail: 'メールアドレスの形式を確認してください。',
    errMsg: '本文を入力してください。',
    errTooLong: '入力が長すぎます。短くしてからもう一度お試しください。',
    errChallenge: '確認に失敗しました。ページを再読み込みしてもう一度お試しください。',
    errRate: '短い時間に送りすぎです。しばらく置いてからお試しください。',
    errSend: '送信できませんでした。時間をおいてもう一度お試しください。',
    errPending: '確認がまだ終わっていません。少しだけ待ってからもう一度どうぞ。',
    sentHead: '送信しました。ありがとうございます。',
    sentBody: 'だいたい夜に返信します。少しだけお待ちください。',
    sendAnother: 'もう一件送る',
    workHead: 'お仕事について',
    workBody: 'お仕事の依頼お待ちしてます。上のフォーム、または X の DM からどうぞ。Discord にフレンド申請してからでも大丈夫です。',
  },
  en: {
    title: 'Say hi',
    intro: "Any of these work. Fair warning: I'm basically nocturnal.",
    xLabel: 'X (Twitter)',
    discordCopy: 'Copy ID',
    discordCopied: 'Copied',
    toastCopied: 'Copied to clipboard',
    formHead: 'Send a message',
    formIntro: "Lands straight in my inbox. I'll reply to the email you leave here.",
    fName: 'Name',
    fEmail: 'Email',
    fMessage: 'Message',
    phName: 'Your name (handles welcome)',
    phEmail: 'you@example.com',
    phMsg: 'Work stuff, feedback, or just saying hi — all welcome',
    submit: 'Send it',
    submitting: 'Sending…',
    errName: 'Name, please — a handle works.',
    errEmail: 'That email looks a little off.',
    errMsg: "Don't forget the message itself.",
    errTooLong: "That's longer than I can take. Trim it down and try again.",
    errChallenge: 'The check did not go through. Reload the page and give it another go.',
    errRate: "That's a lot of messages in a short while. Give it a bit and try again.",
    errSend: "Couldn't get that sent. Try again in a little while.",
    errPending: "Still checking you're human. Give it a second, then try again.",
    sentHead: 'Sent. Appreciate it.',
    sentBody: 'Replies usually happen after dark. Hang tight.',
    sendAnother: 'Send another',
    workHead: 'Got a project?',
    workBody: "I'm taking on work. The form above, a DM on X, or a Discord friend request first — whatever's easiest.",
  },
} satisfies Record<Locale, ContactCopy>;

interface AboutCopy {
  title: string;
  p1: string;
  p2: string;
  seeContact: string;
  siteHead: string;
  /** The sentence wraps an inline link to the history page, so it is three pieces. */
  siteBefore: string;
  siteLink: string;
  siteAfter: string;
  altAvatar: string;
}

export const ABOUT_COPY = {
  ja: {
    title: 'eve0415 について',
    p1: '広く浅く技術を嗜むプロダクトエンジニア。新しい技術はとりあえず試す派です。最近は Rust 製の devcontainer CLI「cella」と、OpenAPI コンパイラ「oasts」を作っています。',
    p2: 'お仕事の依頼お待ちしてます。',
    seeContact: '連絡先を見る',
    siteHead: 'このサイトについて',
    siteBefore: 'アイコンとヘッダーアートは AI 生成です。サイト本体のデザインは Claude Design で組み立てました。2022年からの変遷は',
    siteLink: '歴史のページ',
    siteAfter: 'にまとめています。',
    altAvatar: 'eve0415 のアイコン。オッドアイの黒猫のイラスト(AI生成)',
  },
  en: {
    title: 'About eve0415',
    p1: 'Product engineer, curious about pretty much everything. New tech gets tried the week it ships. Currently building cella, a devcontainer CLI in Rust, and oasts, an OpenAPI compiler.',
    p2: "And yes — I'm open for work.",
    seeContact: 'Get in touch',
    siteHead: 'About this site',
    // The trailing space is the gap before the inline link and belongs to the
    // string — JSX would collapse it if it were written as markup.
    siteBefore: 'The avatar and header art are AI-generated. The site itself was designed in Claude Design. The full story since 2022 is on the ',
    siteLink: 'lore page',
    siteAfter: '.',
    altAvatar: "eve0415's avatar — an odd-eyed black cat illustration (AI-generated)",
  },
} satisfies Record<Locale, AboutCopy>;

/** One row of the LAB card. The order these are declared in is the render order. */
export type LabKey =
  | 'navigationApi'
  | 'viewTransitions'
  | 'scrollState'
  | 'scrollDriven'
  | 'siblingIndex'
  | 'squircleCorners'
  | 'textBoxTrim'
  | 'textScale'
  | 'fieldSizing'
  | 'cssFunction'
  | 'gapDecorations'
  | 'urlPattern'
  | 'anchorPositioning'
  | 'detailsContent'
  | 'scrollend'
  | 'durationFormat'
  | 'promiseTry';

interface LabCopy {
  title: string;
  intro: string;
  /** `undefined` before the browser has been probed, when there is no count to show. */
  toggle: (supported: number | undefined, total: number) => string;
  stateSupported: string;
  stateUnsupported: string;
  /**
   * Not in the design, which runs the probes client-only and so never has a
   * third state. The prerendered HTML does, and claiming either answer there
   * would be a lie half the time.
   */
  stateUnknown: string;
  /**
   * What the row means. Thirteen of the seventeen describe something this site
   * really does; the other four are features it watches rather than uses, and
   * their notes say so outright — the badge is a fact about the visitor's
   * browser, so a note that claimed the site used the feature would badge a lie
   * as live.
   */
  notes: Record<LabKey, string>;
}

export const LAB_COPY = {
  ja: {
    title: '新しい Web の機能と、このサイトでの使い方',
    intro:
      '実験場なので、出たばかりの Web の機能をなるべく早く入れています。ここで実際に使っているものと、まだ様子見のものを、お使いのブラウザの対応状況と並べておきます。',
    toggle: (supported, total) => (supported === undefined ? '実験の一覧を見る' : `実験の一覧を見る（お使いのブラウザは ${supported}/${total} 対応）`),
    stateSupported: '対応',
    stateUnsupported: '未対応',
    stateUnknown: '確認中',
    notes: {
      navigationApi: 'まだ使っていません。ページ移動はルーター側で処理しています。',
      viewTransitions: '送信完了への切り替えをフォームの中だけで行います。背景の空は止まりません。',
      scrollState: 'ヘッダーが貼り付いている間だけ、下の線が光ります。',
      scrollDriven: '読み進めた分だけ要素が現れ、ヘッダーの彗星が進みます。',
      siblingIndex: 'タグの登場を1つずつずらしています。JS は使っていません。',
      squircleCorners: 'まだ入れていません。カードの角は今のところ普通の丸角です。',
      textBoxTrim: '見出しの上下の余白を字面に合わせて詰めています。',
      textScale: '文字を全部 rem で組んであり、OS の文字サイズ設定がそのまま反映されます。',
      fieldSizing: 'お問い合わせの入力欄が中身に合わせて伸びます。',
      cssFunction: '光り方の処方を CSS の関数にまとめています。',
      gapDecorations: 'できること のグリッドの隙間に区切り線を引いています。',
      urlPattern: 'ここでは使っていません。経路の判定はルーターがやっています。',
      anchorPositioning: 'コピー完了のトーストが、押したボタンの真上に出ます。',
      detailsContent: 'この一覧の開閉そのものをアニメーションさせています。',
      scrollend: 'スクロールが止まったとき、たまに流れ星がひとつ流れます。',
      durationFormat: 'フッターの滞在時間の表記に使っています。',
      promiseTry: 'ここでは使っていません。クリップボード書き込みは素の try/catch です。',
    },
  },
  en: {
    title: 'New platform features, and what this site does with them',
    intro:
      'This site is a testbed, so new platform features go in early. Some are running here, some I am still watching — the badges show what your browser supports either way.',
    toggle: (supported, total) => (supported === undefined ? 'See the experiments' : `See the experiments (your browser supports ${supported}/${total})`),
    stateSupported: 'supported',
    stateUnsupported: 'not yet',
    stateUnknown: 'checking',
    notes: {
      navigationApi: 'Not used here — page moves still go through the router.',
      viewTransitions: 'The sent state swaps inside the form alone, so the sky keeps moving.',
      scrollState: 'The hairline under the header lights up only while it is stuck.',
      scrollDriven: 'Sections reveal as you scroll, and the comet on the header tracks progress.',
      siblingIndex: 'Tags stagger in by their index, with no JavaScript.',
      squircleCorners: 'Not in yet — card corners are still plain radii.',
      textBoxTrim: 'Headings are trimmed to their cap height and baseline.',
      textScale: 'All type is set in rem, so your OS text-size setting carries through.',
      fieldSizing: 'The contact textarea grows with its content.',
      cssFunction: 'The glow recipe is a native CSS function.',
      gapDecorations: 'Rules are drawn into the grid gaps on the skills page.',
      urlPattern: 'Not used here — the router does its own route matching.',
      anchorPositioning: 'The copied toast appears right above the button you pressed.',
      detailsContent: 'This very list animates open and closed with it.',
      scrollend: 'When your scrolling settles, sometimes a single star falls.',
      durationFormat: 'Formats the dwell time in the footer.',
      promiseTry: 'Not used here — the clipboard writes are a plain try/catch.',
    },
  },
} satisfies Record<Locale, LabCopy>;

/**
 * Verbatim from the design; both locales are authored, not translated at
 * runtime. Keyed by locale then path so a missing page is a compile error.
 *
 * The design carries no meta descriptions, so each page's own lede stands in
 * rather than new prose being written for it.
 */
export const PAGE_COPY = {
  ja: {
    '/': {
      title: 'eve0415.net — プロダクトエンジニア',
      description: '広く浅く技術を嗜むプロダクトエンジニア。新しい技術はとりあえず試す派です。',
    },
    '/projects': { title: '作ったもの | eve0415.net', description: WORKS_COPY.ja.intro },
    '/projects/ifpatcher': { title: 'IFPatcher | eve0415.net', description: IFPATCHER_COPY.ja.lede },
    '/projects/cella': { title: 'cella | eve0415.net', description: CELLA_COPY.ja.lede },
    '/projects/oasts': { title: 'oasts | eve0415.net', description: OASTS_COPY.ja.lede },
    '/projects/dotclaude': { title: 'dotclaude | eve0415.net', description: DOTCLAUDE_COPY.ja.lede },
    '/projects/website': { title: 'eve0415.net の歴史 | eve0415.net', description: HISTORY_COPY.ja.intro },
    '/skills': { title: 'できること | eve0415.net', description: SKILLS_COPY.ja.intro },
    '/links': { title: 'つながる | eve0415.net', description: CONTACT_COPY.ja.intro },
    '/about': { title: 'About | eve0415.net', description: ABOUT_COPY.ja.p1 },
  },
  en: {
    '/': {
      title: 'eve0415.net — Product Engineer',
      description: "Product engineer who dabbles in a bit of everything. If it's new, I've probably already tried it.",
    },
    '/projects': { title: 'Works | eve0415.net', description: WORKS_COPY.en.intro },
    '/projects/ifpatcher': { title: 'IFPatcher | eve0415.net', description: IFPATCHER_COPY.en.lede },
    '/projects/cella': { title: 'cella | eve0415.net', description: CELLA_COPY.en.lede },
    '/projects/oasts': { title: 'oasts | eve0415.net', description: OASTS_COPY.en.lede },
    '/projects/dotclaude': { title: 'dotclaude | eve0415.net', description: DOTCLAUDE_COPY.en.lede },
    '/projects/website': { title: 'The lore | eve0415.net', description: HISTORY_COPY.en.intro },
    '/skills': { title: 'Skills | eve0415.net', description: SKILLS_COPY.en.intro },
    '/links': { title: 'Say hi | eve0415.net', description: CONTACT_COPY.en.intro },
    '/about': { title: 'About | eve0415.net', description: ABOUT_COPY.en.p1 },
  },
} satisfies Record<Locale, Record<RoutePath, PageCopy>>;
