/**
 * The site's security headers, in one place because they are served from two.
 *
 * The 20 prerendered pages are answered by Cloudflare's asset server before the
 * Worker is ever invoked, so the request middleware in `start.ts` cannot put a
 * header on them — those come from `_headers`, a static file. Only what the
 * Worker renders itself (the 404, server function calls) goes through the
 * middleware. Both read this module: `start.ts` at runtime, and the `headers()`
 * plugin in `vite.config.ts`, which writes `_headers` into the client build the
 * same way `sitemap()` writes `sitemap.xml`.
 *
 * That is what makes the two paths agree by construction. They used to be
 * independent transcriptions with a comment on each saying they had to be
 * changed together and nothing checking that they were.
 *
 * There is deliberately no per-request nonce. A prerendered file's markup is
 * fixed at build time, so a nonce baked into it is public and inert; noncing
 * only the Worker's half would leave the two paths on different policies, and a
 * route dropped from `ROUTES` in vite.config.ts silently stops prerendering and
 * falls through to whichever one was never exercised. `'unsafe-inline'` is what
 * Start's two inline hydration scripts need on both paths, and the directives
 * carrying the real weight here — frame-ancestors, object-src, base-uri,
 * form-action — are untouched by it.
 *
 * `challenges.cloudflare.com` is Turnstile: it loads its script from that origin
 * and renders the challenge in an iframe served from it, so both `script-src`
 * and `frame-src` have to name it or the contact form's widget never appears.
 *
 * Nothing here may import from `@tanstack/react-start` or read `import.meta.env`
 * — `vite.config.ts` loads this module at config time, before either exists.
 */
const buildCsp = (dev: boolean): string => {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' ${dev ? "'unsafe-eval' " : ''}https://challenges.cloudflare.com https://static.cloudflareinsights.com`,
    // The sky, the stars and the cat art are positioned with inline `style`
    // attributes, which no hash or nonce can cover.
    "style-src 'self' 'unsafe-inline'",
    // `data:` on both because Vite inlines any asset under `assetsInlineLimit`
    // (4 KB by default) as a data URI. Nothing is small enough today, so
    // dropping these would break the first icon or font that is — silently, at
    // runtime, with a green build.
    "img-src 'self' data:",
    "font-src 'self' data:",
    `connect-src 'self' ${dev ? 'ws: wss: ' : ''}https://challenges.cloudflare.com https://cloudflareinsights.com`,
    'frame-src https://challenges.cloudflare.com',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];

  // Rewrites http://localhost to https:// under `vite dev`.
  if (!dev) directives.push('upgrade-insecure-requests');

  return directives.join('; ');
};

/** X-Frame-Options is absent on purpose: `frame-ancestors 'none'` supersedes it. */
export const securityHeaders = (dev: boolean) =>
  [
    ['Content-Security-Policy', buildCsp(dev)],
    ['X-Content-Type-Options', 'nosniff'],
    ['Referrer-Policy', 'strict-origin-when-cross-origin'],
    ['Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()'],
  ] as const satisfies [string, string][];
