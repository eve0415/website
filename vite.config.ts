import type { RoutePath } from '#i18n/copy';
import type { Plugin } from 'vite';

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import nodePath from 'node:path';

import { cloudflare } from '@cloudflare/vite-plugin';
import unicodeRanges from '@fontsource/noto-sans-jp/unicode.json' with { type: 'json' };
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import subsetFont from 'subset-font';
import { defineConfig, parseSync } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';

import { SITE_URL } from '#i18n/head';
import { DEFAULT_LOCALE, LOCALES, localePath } from '#i18n/locale';
import { securityHeaders } from '#security-headers';

/**
 * Every route, keyed by the `RoutePath` its copy is written against.
 * `autoStaticPathsDiscovery` and `crawlLinks` are both off, so a route missing
 * from here silently never prerenders and `failOnError` does not catch it — the
 * `satisfies` is what turns that into a compile error instead.
 */
const ROUTE_SET = {
  '/': true,
  '/projects': true,
  '/projects/ifpatcher': true,
  '/projects/cella': true,
  '/projects/oasts': true,
  '/projects/dotclaude': true,
  '/projects/website': true,
  '/skills': true,
  '/links': true,
  '/about': true,
} satisfies Record<RoutePath, true>;

const ROUTES = Object.keys(ROUTE_SET);

/**
 * Through `localePath` rather than a second `/en` concatenation: a third locale
 * makes every `satisfies Record<Locale, …>` in the copy a compile error, and
 * this would have gone on silently emitting exactly two URLs per route.
 */
const localeAlternates = (route: string) => [
  ...LOCALES.map(locale => ({ hreflang: locale, href: `${SITE_URL}${localePath(locale, route)}` })),
  { hreflang: 'x-default', href: `${SITE_URL}${localePath(DEFAULT_LOCALE, route)}` },
];

/** Both locales of a route, Japanese first, as the paths they are served at. */
const localePaths = (route: string) => LOCALES.map(locale => localePath(locale, route));

const PAGES = ROUTES.flatMap(route => localePaths(route).map(path => ({ path })));

/**
 * The sitemap protocol's target namespace. The scheme is part of the name and
 * namespaces are matched as exact strings, so the `https` spelling is a different
 * namespace entirely — a document declaring it fails schema validation and
 * crawlers are entitled to ignore it.
 */
const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';

const XHTML_NS = 'http://www.w3.org/1999/xhtml';

/**
 * Every `loc` and `href` here is built from `SITE_URL` and the ASCII route list
 * above, so there is nothing for XML escaping to do; if a route ever carries an
 * `&` or a non-ASCII character, this needs an escaper before it needs anything else.
 */
const sitemapXml = (): string => {
  const lastmod = new Date().toISOString().slice(0, 10);

  const urls = ROUTES.flatMap(route => {
    const alternates = localeAlternates(route).map(ref => `    <xhtml:link rel="alternate" href="${ref.href}" hreflang="${ref.hreflang}" />`);

    return localePaths(route).map(path =>
      ['  <url>', `    <loc>${SITE_URL}${path}</loc>`, `    <lastmod>${lastmod}</lastmod>`, ...alternates, '  </url>'].join('\n'),
    );
  });

  return [`<?xml version="1.0" encoding="UTF-8"?>`, `<urlset xmlns="${SITEMAP_NS}" xmlns:xhtml="${XHTML_NS}">`, ...urls, '</urlset>'].join('\n');
};

/**
 * The sitemap is written here rather than by `tanstackStart`'s own generator,
 * which is turned off below.
 *
 * That generator hardcodes the `https` spelling of the namespace, takes no option
 * for it, and is a pinned transitive dependency — so the choice was between
 * rewriting its output after the fact and owning the twenty lines above. Owning
 * them wins because it cannot silently stop working: a post-processor keys off the
 * exact string the generator emits, and a generator that changes its output shape
 * would leave it correcting nothing.
 *
 * Emitted as a Rollup asset in the client build, which is where the rest of the
 * static output is written from.
 */
const sitemap = (): Plugin => ({
  name: 'sitemap',
  applyToEnvironment: environment => environment.name === 'client',
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml() });
  },
});

/**
 * Content-hashed assets never change under their name, so they are immutable.
 * Everything else here is replaced on a deploy under the same name, hence a day
 * rather than a year. HTML carries no rule at all on purpose: a prerendered page
 * is rewritten on every deploy while its assets are not.
 */
const CACHE_RULES: [string, string][] = [
  ['/assets/*', 'public, max-age=31536000, immutable'],
  ...['ico', 'png', 'jpg', 'webp', 'avif', 'svg', 'webmanifest', 'xml', 'txt'].map((extension): [string, string] => [
    `/:file.${extension}`,
    'public, max-age=86400',
  ]),
];

const headersFile = (): string =>
  [
    '# Generated by the `headers` plugin in vite.config.ts. Do not edit.',
    '# The security block is `securityHeaders(false)` from src/security-headers.ts,',
    '# the same values the request middleware sets on what the Worker renders.',
    '/*',
    ...securityHeaders(false).map(([name, value]) => `  ${name}: ${value}`),
    ...CACHE_RULES.flatMap(([path, value]) => ['', path, `  Cache-Control: ${value}`]),
    '',
  ].join('\n');

/**
 * Writes `_headers` for Cloudflare's asset server, which answers the 20
 * prerendered pages without ever invoking the Worker — so the request
 * middleware cannot reach them and this file is the only thing that can.
 *
 * Generated rather than committed because it was previously a second, hand-kept
 * transcription of the same policy, with a comment on each copy saying the two
 * had to be changed together and no build step checking that they were.
 */
const headers = (): Plugin => ({
  name: 'headers',
  applyToEnvironment: environment => environment.name === 'client',
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: '_headers', source: headersFile() });
  },
});

/**
 * Reads a `tw('…')` marker call off a parsed node, as `[start, end]` of the call
 * and of the string it wraps. Narrowed rather than typed against the AST because
 * `JSON.stringify` is what walks the tree, and it hands every node over as `unknown`.
 */
const twCall = (node: unknown): readonly [number, number, number, number] | null => {
  if (typeof node !== 'object' || node === null) return null;
  if (!('type' in node) || node.type !== 'CallExpression') return null;
  if (!('start' in node) || typeof node.start !== 'number') return null;
  if (!('end' in node) || typeof node.end !== 'number') return null;

  if (!('callee' in node)) return null;
  const { callee } = node;
  if (typeof callee !== 'object' || callee === null) return null;
  if (!('type' in callee) || callee.type !== 'Identifier') return null;
  if (!('name' in callee) || callee.name !== 'tw') return null;

  if (!('arguments' in node) || !Array.isArray(node.arguments) || node.arguments.length !== 1) return null;
  const argument: unknown = node.arguments.at(0);
  if (typeof argument !== 'object' || argument === null) return null;
  if (!('type' in argument) || argument.type !== 'Literal') return null;
  if (!('value' in argument) || typeof argument.value !== 'string') return null;
  if (!('start' in argument) || typeof argument.start !== 'number') return null;
  if (!('end' in argument) || typeof argument.end !== 'number') return null;

  return [node.start, node.end, argument.start, argument.end];
};

/** Spaces, keeping the line breaks, so every later offset stays where it was. */
const blank = (text: string): string => text.replaceAll(/[^\n]/gu, ' ');

/**
 * Drops the `tw()` marker calls, leaving the class list they wrap.
 *
 * `tw` exists so oxlint and oxfmt can see a class list that lives in a constant
 * rather than in JSX, and it returns its argument unchanged — but nothing else
 * removes it. oxc's minifier does not inline across chunk boundaries, so left
 * alone the identity function ships in the shared chunk and every marked list
 * becomes a call to it: 0.47 KiB raw and 0.09 KiB gzip of client JS, measured.
 *
 * The marker is matched by name within a module that imports it, without scope
 * analysis: `eslint(no-shadow)` runs at error, so a local binding called `tw`
 * cannot reach the build to be mistaken for the import.
 *
 * Runs after `vite:react-compiler`, which is `enforce: 'pre'`, so what arrives
 * here is plain JS. The call is overwritten with spaces rather than cut out,
 * which is why this returns no source map: every byte keeps its offset and every
 * line its number, so the map the next plugin holds is still correct.
 */
const stripTw = (): Plugin => ({
  name: 'strip-tw',
  transform: {
    filter: { code: 'tw(' },
    handler(code, id) {
      const { program } = parseSync(id, code);

      const importsTw = program.body.some(
        node =>
          node.type === 'ImportDeclaration' &&
          node.source.value === '#lib/tw' &&
          node.specifiers.some(specifier => specifier.type === 'ImportSpecifier' && specifier.local.name === 'tw'),
      );
      if (!importsTw) return null;

      const calls: (readonly [number, number, number, number])[] = [];
      JSON.stringify(program, (_key: string, value: unknown) => {
        const call = twCall(value);
        if (call) calls.push(call);
        return value;
      });
      if (calls.length === 0) return null;

      let stripped = code;
      for (const [start, end, argumentStart, argumentEnd] of calls) {
        stripped =
          stripped.slice(0, start) +
          blank(stripped.slice(start, argumentStart)) +
          stripped.slice(argumentStart, argumentEnd) +
          blank(stripped.slice(argumentEnd, end)) +
          stripped.slice(end);
      }

      return { code: stripped, map: null };
    },
  },
});

/**
 * The two Japanese Noto faces carry the whole JIS repertoire — 2.03 MB across
 * the pair, 86% of what a page transfers. Both are `VeryHigh` priority, so on a
 * slow link they are ~10s of the critical path, and on the pages whose largest
 * element is text that time lands directly in LCP.
 *
 * The site's own copy draws on ~500 of those glyphs, so each face is cut to the
 * characters `src` contains. What that misses is anything a visitor types, which
 * only the contact form can produce; its fields name the fallback family
 * declared beside them, and the browser resolves those characters per-character
 * out of @fontsource's unicode-range chunks.
 *
 * The glyph set comes from `src` rather than the prerendered HTML because the
 * prerender runs after the client build that has to emit these files. Scanning
 * source is also a superset: every character in the 20 rendered pages appears in
 * `src`, plus the ones only reachable through a runtime branch.
 */
const { join } = nodePath;

const SUBSET_WEIGHTS = [400, 700] as const;

/**
 * Where the copy lives. `.css` is in because `content:` strings render too;
 * tests are out because nothing they contain reaches a page, and their fixtures
 * were pulling ~85 glyphs nobody ever sees into both faces.
 */
const SUBSET_SOURCES = /(?<!\.test)\.(?:css|tsx?)$/u;

/**
 * Written into the tree rather than a cache directory so `__root.css` can point
 * at them with an ordinary relative URL — that keeps them inside Vite's asset
 * pipeline, which hashes the bytes it actually emits. A cached copy behind a
 * resolver would hash the pre-subset file and serve a year-immutable URL whose
 * contents had changed. Gitignored; `-` keeps the directory off the route tree.
 */
const SUBSET_DIR = 'src/routes/-fonts';

const subsetFileName = (weight: number): string => `noto-sans-jp-japanese-${weight}-subset.woff2`;

/** The fallback family's stylesheet, imported by the contact form alone. */
const FALLBACK_CSS = 'noto-sans-jp-fallback.css';

/**
 * @fontsource ships the same unicode-range split Google Fonts serves — 120
 * numbered chunks per weight, ~9 KB each — and `unicode.json` is the only place
 * those ranges are published as data; the per-subset stylesheets bake them into
 * CSS this cannot read back.
 *
 * Declaring all 240 is what makes the fallback cost nothing until it is used: a
 * chunk is only fetched once a character in its range is on the page, so a
 * visitor typing kana pulls the one chunk their kana needs and no other. The
 * rules themselves are ~190 KB of CSS, which is why they are imported by the
 * one route that can need them rather than from `__root.css`.
 */
const chunkFallbackCss = (): string => {
  const chunks = Object.entries(unicodeRanges).filter(([key]) => /^\[\d+\]$/u.test(key));
  if (chunks.length === 0) throw new Error('@fontsource/noto-sans-jp: unicode.json declares no numbered chunks');

  const rules = SUBSET_WEIGHTS.flatMap(weight =>
    chunks.map(([key, range]) => {
      const id = key.slice(1, -1);

      return [
        '@font-face {',
        `  font-family: 'Noto Sans JP Fallback';`,
        '  font-style: normal;',
        `  font-weight: ${weight};`,
        '  font-display: swap;',
        `  src: url('@fontsource/noto-sans-jp/files/noto-sans-jp-${id}-${weight}-normal.woff2') format('woff2');`,
        `  unicode-range: ${range};`,
        '}',
      ].join('\n');
    }),
  );

  return ['/* Generated by the `subsetFonts` plugin in vite.config.ts. Do not edit. */', ...rules, ''].join('\n\n');
};

/** Every distinct character in the site's own source, as one string. */
const sourceGlyphs = async (root: string): Promise<string> => {
  const glyphs = new Set<string>();

  const walk = async (dir: string): Promise<void> => {
    const entries = await readdir(dir, { withFileTypes: true });

    await Promise.all(
      entries.map(async entry => {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) return walk(full);
        if (!SUBSET_SOURCES.test(entry.name)) return;
        for (const glyph of await readFile(full, 'utf8')) glyphs.add(glyph);
      }),
    );
  };

  await walk(join(root, 'src'));
  return [...glyphs].join('');
};

/**
 * `buildStart` fires once per environment and this has to have run before the
 * client's `__root.css` is resolved, so the work is shared through one promise
 * rather than repeated for the ssr build.
 */
const subsetFonts = (): Plugin => {
  let root = process.cwd();
  let written: Promise<void> | null = null;

  const write = async (): Promise<void> => {
    const [text] = await Promise.all([sourceGlyphs(root), mkdir(join(root, SUBSET_DIR), { recursive: true })]);

    await Promise.all([
      ...SUBSET_WEIGHTS.map(async weight => {
        const source = await readFile(join(root, `node_modules/@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-${weight}-normal.woff2`));
        await writeFile(join(root, SUBSET_DIR, subsetFileName(weight)), await subsetFont(source, text, { targetFormat: 'woff2' }));
      }),
      writeFile(join(root, SUBSET_DIR, FALLBACK_CSS), chunkFallbackCss()),
    ]);
  };

  return {
    name: 'subset-fonts',
    configResolved(config) {
      ({ root } = config);
    },
    async buildStart() {
      written ??= write();
      await written;
    },
  };
};

export default defineConfig({
  plugins: [
    // First: `__root.css` references the files it writes.
    subsetFonts(),
    cloudflare({
      viteEnvironment: { name: 'ssr' },
    }),
    tanstackStart({
      prerender: {
        enabled: true,
        // false: the default writes `/x` as `x/index.html`, which the Cloudflare
        // asset worker then 307s to `/x/`, so every slash-free canonical would
        // point at a redirect.
        autoSubfolderIndex: false,
        autoStaticPathsDiscovery: false,
        crawlLinks: false,
        failOnError: true,
      },
      // Off in favour of `sitemap()` below, which emits the same document in the
      // namespace the protocol actually defines. `pages` still drives prerendering.
      sitemap: {
        enabled: false,
      },
      pages: PAGES,
    }),
    sitemap(),
    headers(),
    devtools({
      eventBusConfig: { enabled: true },
    }),
    react({ compiler: { panicThreshold: 'critical_errors' } }),
    stripTw(),
    tailwindcss(),
    devtoolsJson(),
  ],
  build: {
    // Below these versions Lightning CSS downlevels light-dark() into two
    // undefined var() calls with no separator, emitting no warning and no
    // prefers-color-scheme fallback.
    cssTarget: ['chrome125', 'firefox125', 'safari18'],
    // Declared at the root, then switched off for the client below, because
    // `vite:react-compiler` reads this one value at `configResolved` and never
    // looks at the per-environment build options. Setting it on `ssr` alone left
    // the plugin emitting no source map for the SSR bundle it had just rewritten,
    // and the maps `upload_source_maps` ships pointed at the wrong lines.
    sourcemap: true,
  },
  environments: {
    client: {
      build: {
        sourcemap: false,
      },
    },
    ssr: {
      build: {
        minify: 'oxc',
      },
    },
  },
  server: {
    host: true,
    watch: {
      // Agent worktrees land under .claude/ while the dev server is running, and
      // chokidar readlink()s each new entry as it appears. A worktree half
      // materialised answers EINVAL, which reaches the FSWatcher as an unhandled
      // 'error' event and takes the whole process down.
      ignored: ['**/.claude/**'],
    },
  },
});
