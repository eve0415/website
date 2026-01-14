// Security middleware utilities for CSP and security headers
// Uses Web Crypto API for Cloudflare Workers compatibility

/**
 * Generate a cryptographically secure nonce using Web Crypto API.
 * Returns a base64-encoded 16-byte random value.
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

/**
 * Build Content-Security-Policy header value.
 * Development mode is relaxed to allow HMR and debugging.
 * Production mode uses strict CSP with nonces.
 */
export function buildCspHeader(nonce: string): string {
  if (import.meta.env.DEV) {
    // Relaxed CSP for development - allows HMR, inline scripts, eval
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' ws: wss: https://challenges.cloudflare.com",
      'frame-src https://challenges.cloudflare.com',
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');
  }

  // Production CSP - strict-dynamic with nonce fallback
  // Note: TanStack Start doesn't currently bridge middleware context to router SSR options,
  // so 'strict-dynamic' is used to allow scripts loaded by trusted scripts.
  // 'unsafe-inline' is kept as fallback for browsers that don't support 'strict-dynamic'.
  return [
    "default-src 'self'",
    `script-src 'strict-dynamic' 'nonce-${nonce}' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com`,
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self' https://challenges.cloudflare.com",
    'frame-src https://challenges.cloudflare.com',
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
    'report-uri /api/csp-report',
  ].join('; ');
}

/**
 * Build all security headers including CSP.
 * Returns a record of header name to value.
 */
export function buildSecurityHeaders(csp: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Security-Policy': csp,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  };

  return headers;
}
