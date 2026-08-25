/**
 * Every prerendered page, transcribed — origin, prefix, extension and all.
 *
 * Nothing here is computed. The build lays these paths out through `localePath`
 * (`vite.config.ts`'s `localePaths` and `localeAlternates`, feeding `pages`) and
 * writes every canonical through `canonicalUrl`, which is `SITE_URL` plus the
 * same `localePath`. An expectation built the same way moves with the code it is
 * checking: point `SITE_URL` at `https://example.com` and every canonical,
 * hreflang and `<loc>` follows it while all of these still pass — measured, not
 * supposed. So this table is a second, independent source for the locale-prefix
 * rule rather than an echo of it, and `SITE_URL` is spelled out for exactly the
 * reason the paths are.
 *
 * It lives here rather than beside the `node:fs` helpers because the source
 * tests need the same literals without the build having happened:
 * `test/dist/client-output.ts` throws at import when `dist/client` is missing,
 * which is the contract the `dist` project and the Playwright specs want and the
 * `source` project must not inherit.
 *
 * The deliberate cost: a new route now needs an entry here as well as in
 * `ROUTE_SET` in `vite.config.ts`. AGENTS.md is otherwise against a second
 * hand-kept transcription — `_headers` is generated for that reason — but the
 * same file already carries the exception this falls under: `_headers` is
 * *asserted* as literal directives, because reading it back from
 * `securityHeaders(false)` would compare the generator to itself and pass on any
 * policy at all. Generate the artifact, transcribe the assertion.
 */
interface Served {
  /** Where `autoSubfolderIndex: false` writes the page, relative to `dist/client`. */
  file: string;
  /** The page's URL, which is also what its canonical and its `<loc>` must say. */
  url: string;
}

const PAGE_TABLE = [
  {
    ja: { file: 'index.html', url: 'https://eve0415.net/' },
    en: { file: 'en.html', url: 'https://eve0415.net/en' },
  },
  {
    ja: { file: 'projects.html', url: 'https://eve0415.net/projects' },
    en: { file: 'en/projects.html', url: 'https://eve0415.net/en/projects' },
  },
  {
    ja: { file: 'projects/ifpatcher.html', url: 'https://eve0415.net/projects/ifpatcher' },
    en: { file: 'en/projects/ifpatcher.html', url: 'https://eve0415.net/en/projects/ifpatcher' },
  },
  {
    ja: { file: 'projects/cella.html', url: 'https://eve0415.net/projects/cella' },
    en: { file: 'en/projects/cella.html', url: 'https://eve0415.net/en/projects/cella' },
  },
  {
    ja: { file: 'projects/oasts.html', url: 'https://eve0415.net/projects/oasts' },
    en: { file: 'en/projects/oasts.html', url: 'https://eve0415.net/en/projects/oasts' },
  },
  {
    ja: { file: 'projects/dotclaude.html', url: 'https://eve0415.net/projects/dotclaude' },
    en: { file: 'en/projects/dotclaude.html', url: 'https://eve0415.net/en/projects/dotclaude' },
  },
  {
    ja: { file: 'projects/website.html', url: 'https://eve0415.net/projects/website' },
    en: { file: 'en/projects/website.html', url: 'https://eve0415.net/en/projects/website' },
  },
  {
    ja: { file: 'skills.html', url: 'https://eve0415.net/skills' },
    en: { file: 'en/skills.html', url: 'https://eve0415.net/en/skills' },
  },
  {
    ja: { file: 'links.html', url: 'https://eve0415.net/links' },
    en: { file: 'en/links.html', url: 'https://eve0415.net/en/links' },
  },
  {
    ja: { file: 'about.html', url: 'https://eve0415.net/about' },
    en: { file: 'en/about.html', url: 'https://eve0415.net/en/about' },
  },
] as const satisfies { ja: Served; en: Served }[];

export interface Page extends Served {
  /** `[hreflang, href]` for the route's whole cluster, in the order it must be emitted. */
  alternates: [string, string][];
}

/** Every page the site prerenders, Japanese first for each route. */
export const PAGES: Page[] = PAGE_TABLE.flatMap(({ ja, en }): Page[] => {
  // Japanese twice on purpose: x-default is the unprefixed locale, and a page
  // has to list itself or the whole cluster is ignored.
  const alternates: [string, string][] = [
    ['ja', ja.url],
    ['en', en.url],
    ['x-default', ja.url],
  ];

  return [
    { ...ja, alternates },
    { ...en, alternates },
  ];
});
