import { expect, it } from 'vitest';

import { ROOT_CSS, emittedFile, emittedForSsr } from './plugin-harness';

/**
 * `vite.config.ts`'s `headers()` plugin, driven through a real build rather than
 * read back off `dist/`: `headersFile` and `CACHE_RULES` are locals of that file.
 */
const headers = async (): Promise<string> => emittedFile('headers', '_headers');

/**
 * Written out rather than read back from `securityHeaders(false)`, which would
 * compare the generator to itself and pass on any policy at all. Changing the
 * policy has to be acknowledged here.
 */
const SECURITY_BLOCK = [
  '/*',
  "  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://challenges.cloudflare.com https://cloudflareinsights.com; frame-src https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
  '  X-Content-Type-Options: nosniff',
  '  Referrer-Policy: strict-origin-when-cross-origin',
  '  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()',
].join('\n');

/**
 * Written out rather than derived from the route list, for the same reason the
 * security block is: a page gaining or losing its cache rule has to be
 * acknowledged here, not inherited from whatever the config happens to emit.
 */
const PAGE_PATHS = [
  '/',
  '/en',
  '/projects',
  '/en/projects',
  '/projects/ifpatcher',
  '/en/projects/ifpatcher',
  '/projects/cella',
  '/en/projects/cella',
  '/projects/oasts',
  '/en/projects/oasts',
  '/projects/dotclaude',
  '/en/projects/dotclaude',
  '/projects/website',
  '/en/projects/website',
  '/skills',
  '/en/skills',
  '/links',
  '/en/links',
  '/about',
  '/en/about',
];

const CACHE_BLOCKS = [
  '/assets/*\n  Cache-Control: public, max-age=31536000, immutable',
  ...PAGE_PATHS.map(path => `${path}\n  Cache-Control: private, max-age=0, stale-while-revalidate=604800`),
  ...['ico', 'png', 'jpg', 'webp', 'avif', 'svg', 'webmanifest', 'xml', 'txt'].map(extension => `/:file.${extension}\n  Cache-Control: public, max-age=86400`),
];

/** Every rule's path, which is every line that is neither a comment, a value, nor blank. */
const RULE_PATHS = [
  '/*',
  '/assets/*',
  ...PAGE_PATHS,
  ...['ico', 'png', 'jpg', 'webp', 'avif', 'svg', 'webmanifest', 'xml', 'txt'].map(extension => `/:file.${extension}`),
];

it('serves the security block on every path', async () => {
  expect(await headers()).toContain(SECURITY_BLOCK);
});

it('serves the cache rules', async () => {
  const file = await headers();

  expect(CACHE_BLOCKS.filter(block => !file.includes(block))).toStrictEqual([]);
});

// The prerendered pages carry `stale-while-revalidate` rather than the
// `must-revalidate` they fall back to without a rule: a deploy rewrites them
// under the same names, so they cannot be immutable, but a hard entry should not
// spend a round trip before it renders either. `private` is load-bearing — a
// shared cache would serve a stale page to a client that never had the assets it
// names by hash.
it('serves rules for exactly those paths', async () => {
  const file = await headers();

  expect(file.split('\n').filter(line => line.startsWith('/'))).toStrictEqual(RULE_PATHS);
});

// Same guard as the sitemap's, and invisible to a client-only build: without it
// `_headers` is written into the SSR bundle too, where nothing serves it.
/**
 * The page's own response headers name the one render-blocking stylesheet, so
 * Cloudflare can replay it as a `103 Early Hints` and the browser can start it
 * before the document has arrived. The `<link>` tags in `<head>` are already
 * found the moment the head is parsed; this is the only thing that gets ahead of
 * them, and on a phone it is a round trip.
 *
 * Asserted per page and then counted, because the header belongs to the twenty
 * pages and to nothing else: `/assets/*` and the file-extension rules would be
 * announcing a stylesheet to a request that is already for one.
 */
const PRELOAD = `  Link: </${ROOT_CSS}>; rel=preload; as=style`;

it('announces the root stylesheet to every page and to nothing else', async () => {
  const file = await headers();

  expect({
    missing: PAGE_PATHS.filter(path => !file.includes(`${path}\n  Cache-Control: private, max-age=0, stale-while-revalidate=604800\n${PRELOAD}`)),
    total: file.split('\n').filter(line => line === PRELOAD).length,
  }).toStrictEqual({ missing: [], total: PAGE_PATHS.length });
});

it('emits nothing outside the client environment', async () => {
  expect(await emittedForSsr('headers')).toStrictEqual([]);
});
