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

const PAGES = ROUTES.flatMap(route => {
  const alternateRefs = localeAlternates(route);
  return [
    { path: route === '' ? '/' : route, sitemap: { alternateRefs } },
    { path: `/en${route}`, sitemap: { alternateRefs } },
  ];
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
      sitemap: {
        enabled: true,
        host: SITE_URL,
      },
      pages: PAGES,
    }),
    devtools({
      eventBusConfig: { enabled: true },
    }),
    react(),
    babel({
      presets: [reactCompilerPreset({ panicThreshold: 'critical_errors' })],
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
