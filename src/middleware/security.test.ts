import { afterEach, describe, expect, test, vi } from 'vitest';

import { buildCspHeader, buildSecurityHeaders, generateNonce } from './security';

describe('generateNonce', () => {
  test('returns a valid base64 string', () => {
    const nonce = generateNonce();

    // Base64 characters only
    expect(nonce).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  test('returns correct length for 16-byte input', () => {
    const nonce = generateNonce();

    // 16 bytes = 128 bits, base64 encodes to ceil(16/3)*4 = 24 characters (with padding)
    expect(nonce.length).toBe(24);
  });

  test('generates unique nonces on each call', () => {
    const nonces = new Set<string>();
    for (let i = 0; i < 100; i++) {
      nonces.add(generateNonce());
    }

    // All 100 should be unique
    expect(nonces.size).toBe(100);
  });

  test('can be decoded back to 16 bytes', () => {
    const nonce = generateNonce();
    const decoded = atob(nonce);

    expect(decoded.length).toBe(16);
  });
});

describe('buildCspHeader', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test('includes common security directives', () => {
    const csp = buildCspHeader('test');

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
  });

  test('allows Cloudflare challenges', () => {
    const csp = buildCspHeader('test');

    expect(csp).toContain('https://challenges.cloudflare.com');
  });

  test('allows images from self, data, and blob URIs', () => {
    const csp = buildCspHeader('test');

    expect(csp).toContain("img-src 'self' data: blob:");
  });

  test('allows fonts from self and data URIs', () => {
    const csp = buildCspHeader('test');

    expect(csp).toContain("font-src 'self' data:");
  });

  // Environment-specific tests - these test the current build environment
  test.skipIf(!import.meta.env.DEV)('development mode includes unsafe-eval for HMR', () => {
    const csp = buildCspHeader('test-nonce');

    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain('ws:');
    expect(csp).not.toContain('nonce-test-nonce');
  });

  test.skipIf(import.meta.env.DEV)('production mode includes strict-dynamic with nonce', () => {
    const csp = buildCspHeader('my-secure-nonce');

    expect(csp).toContain("'strict-dynamic'");
    expect(csp).toContain("'nonce-my-secure-nonce'");
    expect(csp).toContain('report-to default');
    expect(csp).toContain('report-uri /api/csp-report');
    expect(csp).toContain('trusted-types default');
    expect(csp).toContain("require-trusted-types-for 'script'");
  });
});

describe('buildSecurityHeaders', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test('includes CSP header', () => {
    const headers = buildSecurityHeaders('test-csp-value');

    expect(headers['Content-Security-Policy']).toBe('test-csp-value');
  });

  test('includes X-Content-Type-Options', () => {
    const headers = buildSecurityHeaders('test');

    expect(headers['X-Content-Type-Options']).toBe('nosniff');
  });

  test('includes X-Frame-Options', () => {
    const headers = buildSecurityHeaders('test');

    expect(headers['X-Frame-Options']).toBe('DENY');
  });

  test('includes Referrer-Policy', () => {
    const headers = buildSecurityHeaders('test');

    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
  });

  test('includes Permissions-Policy', () => {
    const headers = buildSecurityHeaders('test');

    expect(headers['Permissions-Policy']).toBe('camera=(), microphone=(), geolocation=(), payment=()');
  });

  test.skipIf(import.meta.env.DEV)('includes Reporting-Endpoints header in production', () => {
    const headers = buildSecurityHeaders('test');

    expect(headers['Reporting-Endpoints']).toBe('default="/api/csp-report"');
  });

  test.skipIf(!import.meta.env.DEV)('excludes Reporting-Endpoints header in development', () => {
    const headers = buildSecurityHeaders('test');

    expect(headers['Reporting-Endpoints']).toBeUndefined();
  });
});
