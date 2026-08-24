import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

/** What `vite build` writes, and what Cloudflare's asset server answers from. */
const CLIENT_DIR = 'dist/client';

// Thrown at import time rather than skipped: a suite that reports zero tests
// when the build is missing would be the one failure these tests cannot see.
if (!existsSync(CLIENT_DIR)) {
  throw new Error(`${CLIENT_DIR} is missing. These tests assert over the built output — run \`pnpm build\` first.`);
}

interface Served {
  /** Where `autoSubfolderIndex: false` writes the page, relative to `dist/client`. */
  file: string;
  /** The page's URL, which is also what its canonical and its `<loc>` must say. */
  url: string;
}

/**
 * Every prerendered page, transcribed — origin, prefix, extension and all.
 *
 * Nothing here is computed. The build lays these paths out through `localePath`
 * (`vite.config.ts`'s `localePaths` and `localeAlternates`, feeding `pages`) and
 * writes every canonical through `canonicalUrl`, which is `SITE_URL` plus the
 * same `localePath`. An expectation built the same way moves with the code it is
 * checking: point `SITE_URL` at `https://example.com` and every canonical,
 * hreflang and `<loc>` in `dist/` follows it while all of these still pass —
 * measured, not supposed. So this table is a second, independent source for the
 * locale-prefix rule rather than an echo of it, and `SITE_URL` is spelled out
 * for exactly the reason the paths are.
 *
 * The deliberate cost: a new route now needs an entry here as well as in
 * `ROUTE_SET` in `vite.config.ts`. AGENTS.md is otherwise against a second
 * hand-kept transcription — `_headers` is generated for that reason — but the
 * same file already carries the exception this falls under: `_headers` is
 * *asserted* as literal directives, because reading it back from
 * `securityHeaders(false)` would compare the generator to itself and pass on any
 * policy at all. Generate the artifact, transcribe the assertion.
 */
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

export const exists = (file: string): boolean => existsSync(path.join(CLIENT_DIR, file));

export const read = (file: string): string => readFileSync(path.join(CLIENT_DIR, file), 'utf8');

/** Paths of every built file with this extension, relative to `dist/client`. */
const filesWithExtension = (extension: string): string[] =>
  readdirSync(CLIENT_DIR, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith(extension))
    .map(entry => path.relative(CLIENT_DIR, path.join(entry.parentPath, entry.name)));

export const htmlFiles = (): string[] => filesWithExtension('.html');

export const jsFiles = (): string[] => filesWithExtension('.js');
