import { createCsrfMiddleware, createMiddleware, createStart } from '@tanstack/react-start';

/**
 * Content-Security-Policy, built once for both of the site's delivery paths.
 *
 * The 20 prerendered pages are answered by Cloudflare's asset server before the
 * Worker is ever invoked, so nothing in this file can put a header on them —
 * `public/_headers` carries the identical policy for those, and the two have to
 * be edited together. Only what the Worker renders itself (the 404, server
 * function calls) is covered from here.
 *
 * That is also why there is no per-request nonce. A prerendered file's markup is
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
 */
const buildCsp = (dev: boolean): string => {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' ${dev ? "'unsafe-eval' " : ''}https://challenges.cloudflare.com https://static.cloudflareinsights.com`,
    // The sky, the stars and the cat art are positioned with inline `style`
    // attributes, which no hash or nonce can cover.
    "style-src 'self' 'unsafe-inline'",
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
const SECURITY_HEADERS = [
  ['Content-Security-Policy', buildCsp(import.meta.env.DEV)],
  ['X-Content-Type-Options', 'nosniff'],
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  ['Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()'],
] as const satisfies [string, string][];

// `next` is aliased because `node/callback-return` treats that exact name as a
// Node-style callback and demands its call be returned.
const securityHeaders = createMiddleware({ type: 'request' }).server(async ({ next: proceed }) => {
  const result = await proceed();

  for (const [name, value] of SECURITY_HEADERS) result.response.headers.set(name, value);

  return result;
});

/**
 * `createStartHandler` installs exactly this middleware on its own — but only
 * while the app has no start entry at all. Adding one to get the headers above
 * replaces that default outright, and the only thing that notices is a dev-only
 * `console.warn`; in production the protection would simply be gone. So it is
 * restored here, filter included: `handlerType: 'router'` is ordinary
 * navigation, and demanding a same-origin `Sec-Fetch-Site` on that would refuse
 * every inbound link.
 *
 * Defaults do the rest — `Sec-Fetch-Site: same-origin`, else an `Origin`
 * matching the request's own, else `Referer`, and a 403 when all three are
 * missing.
 */
const csrf = createCsrfMiddleware({ filter: ({ handlerType }) => handlerType === 'serverFn' });

// Order matters: the headers wrap the CSRF check, so its 403 carries them too.
export const startInstance = createStart(() => ({
  requestMiddleware: [securityHeaders, csrf],
}));
