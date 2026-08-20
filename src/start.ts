import { createCsrfMiddleware, createMiddleware, createStart } from '@tanstack/react-start';

import { securityHeaders } from '#security-headers';

const SECURITY_HEADERS = securityHeaders(import.meta.env.DEV);

// `next` is aliased because `node/callback-return` treats that exact name as a
// Node-style callback and demands its call be returned.
const withSecurityHeaders = createMiddleware({ type: 'request' }).server(async ({ next: proceed }) => {
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
  requestMiddleware: [withSecurityHeaders, csrf],
}));
