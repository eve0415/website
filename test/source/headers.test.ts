import { expect, it } from 'vitest';

import { emittedFile, emittedForSsr } from './plugin-harness';

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
  ...PAGE_PATHS.map(path => `${path}\n  Cache-Control: public, max-age=0, stale-while-revalidate=604800`),
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
// spend a round trip before it renders either.
it('serves rules for exactly those paths', async () => {
  const file = await headers();

  expect(file.split('\n').filter(line => line.startsWith('/'))).toStrictEqual(RULE_PATHS);
});

// Same guard as the sitemap's, and invisible to a client-only build: without it
// `_headers` is written into the SSR bundle too, where nothing serves it.
it('emits nothing outside the client environment', async () => {
  expect(await emittedForSsr('headers')).toStrictEqual([]);
});
