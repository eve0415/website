import { expect, it } from 'vitest';

import { emittedFile } from './plugin-harness';

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

const CACHE_BLOCKS = [
  '/assets/*\n  Cache-Control: public, max-age=31536000, immutable',
  ...['ico', 'png', 'jpg', 'webp', 'avif', 'svg', 'webmanifest', 'xml', 'txt'].map(extension => `/:file.${extension}\n  Cache-Control: public, max-age=86400`),
];

/** Every rule's path, which is every line that is neither a comment, a value, nor blank. */
const RULE_PATHS = ['/*', '/assets/*', ...['ico', 'png', 'jpg', 'webp', 'avif', 'svg', 'webmanifest', 'xml', 'txt'].map(extension => `/:file.${extension}`)];

it('serves the security block on every path', async () => {
  expect(await headers()).toContain(SECURITY_BLOCK);
});

it('serves the cache rules', async () => {
  const file = await headers();

  expect(CACHE_BLOCKS.filter(block => !file.includes(block))).toStrictEqual([]);
});

// No rule for the prerendered pages on purpose: a deploy rewrites them under the
// same names while their content-hashed assets keep theirs.
it('serves rules for exactly those paths', async () => {
  const file = await headers();

  expect(file.split('\n').filter(line => line.startsWith('/'))).toStrictEqual(RULE_PATHS);
});
