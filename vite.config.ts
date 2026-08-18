import type { PluginObj } from '@babel/core';
import type { Plugin } from 'vite';

import { cloudflare } from '@cloudflare/vite-plugin';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';

const SITE_URL = 'https://eve0415.net';

/**
 * Every route, as its Japanese path with the leading `/` and no trailing one.
 * `autoStaticPathsDiscovery` and `crawlLinks` are both off, so a route missing
 * from here silently never prerenders — `failOnError` does not catch it.
 */
const ROUTES = [
  '',
  '/projects',
  '/projects/ifpatcher',
  '/projects/cella',
  '/projects/oasts',
  '/projects/dotclaude',
  '/projects/website',
  '/skills',
  '/links',
  '/about',
];

const localeAlternates = (route: string) => [
  { hreflang: 'ja', href: `${SITE_URL}${route}` },
  { hreflang: 'en', href: `${SITE_URL}/en${route}` },
  { hreflang: 'x-default', href: `${SITE_URL}${route}` },
];

/** Both locales of a route, Japanese first, as the paths they are served at. */
const localePaths = (route: string) => [route === '' ? '/' : route, `/en${route}`];

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
      ['  <url>', `    <loc>${SITE_URL}/${path.slice(1)}</loc>`, `    <lastmod>${lastmod}</lastmod>`, ...alternates, '  </url>'].join('\n'),
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
 * Drops the `tw()` marker calls, leaving the class list they wrap.
 *
 * `tw` exists so oxlint and oxfmt can see a class list that lives in a constant
 * rather than in JSX. It returns its argument unchanged, so nothing about it
 * needs to reach the browser.
 */
const stripTw = (): PluginObj => ({
  name: 'strip-tw',
  visitor: {
    CallExpression(path) {
      const { callee, arguments: args } = path.node;
      if (callee.type !== 'Identifier' || callee.name !== 'tw' || args.length !== 1) return;

      const [argument] = args;
      if (argument?.type !== 'StringLiteral') return;

      const binding = path.scope.getBinding('tw');
      if (binding?.path.parent.type !== 'ImportDeclaration' || binding.path.parent.source.value !== '#routes/-/tw') return;

      path.replaceWith(argument);
    },
  },
});

export default defineConfig({
  plugins: [
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
    devtools({
      eventBusConfig: { enabled: true },
    }),
    react(),
    babel({
      presets: [reactCompilerPreset({ panicThreshold: 'critical_errors' })],
      plugins: [stripTw],
    }),
    tailwindcss(),
    devtoolsJson(),
  ],
  build: {
    // Below these versions Lightning CSS downlevels light-dark() into two
    // undefined var() calls with no separator, emitting no warning and no
    // prefers-color-scheme fallback.
    cssTarget: ['chrome125', 'firefox125', 'safari18'],
  },
  environments: {
    ssr: {
      build: {
        minify: 'oxc',
        sourcemap: true,
      },
    },
  },
  server: {
    host: true,
  },
});
