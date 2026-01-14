// Security middleware utilities for CSP and security headers
// Uses Web Crypto API for Cloudflare Workers compatibility

/**
 * Generate a cryptographically secure nonce using Web Crypto API.
 * Returns a base64url-encoded 16-byte random value (URL-safe, no padding).
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const base64 = btoa(Array.from(array, byte => String.fromCharCode(byte)).join(''));
  // Convert to base64url (URL-safe, no padding)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
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
      "font-src 'self' data:",
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
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
    'trusted-types default',
    "require-trusted-types-for 'script'",
    'report-to default',
    'report-uri /api/csp-report',
  ].join('; ');
}

/**
 * Build all security headers including CSP.
 * Returns a record of header name to value.
 */
export function buildSecurityHeaders(csp: string): Record<string, string> {
  // Note: X-Frame-Options omitted - frame-ancestors 'none' in CSP supersedes it
  const headers: Record<string, string> = {
    'Content-Security-Policy': csp,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  };

  // Add Reporting-Endpoints header for report-to directive (production only)
  if (import.meta.env.PROD) {
    headers['Reporting-Endpoints'] = 'default="/api/csp-report"';
  }

  return headers;
}
