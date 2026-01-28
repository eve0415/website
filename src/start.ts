import type * as schema from '#db/schema';
import type { drizzle } from 'drizzle-orm/d1';

import { createMiddleware, createStart } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';

import { buildCspHeader, buildSecurityHeaders, generateNonce } from './middleware/security';

// Global request middleware for security headers
const securityMiddleware = createMiddleware().server(async ({ next }) => {
  const nonce = generateNonce();

  // Build and set security headers before proceeding
  const csp = buildCspHeader(nonce);
  const headers = buildSecurityHeaders(csp);

  for (const [key, value] of Object.entries(headers)) setResponseHeader(key, value);

  // Execute the request with nonce in context
  return next({
    context: {
      cspNonce: nonce,
    },
  });
});

export const startInstance = createStart(() => ({
  requestMiddleware: [securityMiddleware],
}));

declare module '@tanstack/react-start' {
  interface Register {
    server: {
      requestContext: {
        db: ReturnType<typeof drizzle<typeof schema, D1Database>>;
      };
    };
  }
}
