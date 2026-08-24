import { describe, expect, it } from 'vitest';

import { securityHeaders } from '#security-headers';

const headerValue = (dev: boolean, name: string): string => {
  const found = securityHeaders(dev).find(([header]) => header === name);
  return found === undefined ? '' : found[1];
};

/** Sorted, because directive order carries no meaning in CSP but membership does. */
const directivesOf = (dev: boolean): string[] => headerValue(dev, 'Content-Security-Policy').split('; ').toSorted();

const directive = (dev: boolean, name: string): string => {
  const found = directivesOf(dev).find(part => part === name || part.startsWith(`${name} `));
  return found ?? '';
};

const SHARED = [
  "default-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  'frame-src https://challenges.cloudflare.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
];

/**
 * The whole policy, as a set, per mode. Looking directives up by name cannot
 * catch one being *added* — and `script-src-elem` would override `script-src` in
 * every modern browser, so an unlisted addition defeats the assertions below it.
 */
const POLICY = {
  dev: [
    ...SHARED,
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://static.cloudflareinsights.com",
    "connect-src 'self' ws: wss: https://challenges.cloudflare.com https://cloudflareinsights.com",
  ],
  prod: [
    ...SHARED,
    "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com",
    "connect-src 'self' https://challenges.cloudflare.com https://cloudflareinsights.com",
    'upgrade-insecure-requests',
  ],
};

const MODES: [string, boolean][] = [
  ['dev', true],
  ['prod', false],
];

describe('the policy as a whole', () => {
  it('is exactly this set under vite dev', () => {
    expect(directivesOf(true)).toStrictEqual([...POLICY.dev].toSorted());
  });

  it('is exactly this set in what ships', () => {
    expect(directivesOf(false)).toStrictEqual([...POLICY.prod].toSorted());
  });
});

describe('the dev/prod split', () => {
  it('allows unsafe-eval under vite dev, which needs it', () => {
    expect(directive(true, 'script-src')).toContain("'unsafe-eval'");
  });

  it('does not allow unsafe-eval in what ships', () => {
    expect(directive(false, 'script-src')).not.toContain("'unsafe-eval'");
  });

  it('opens connect-src to websockets under vite dev only', () => {
    expect([directive(true, 'connect-src').includes('ws: wss:'), directive(false, 'connect-src').includes('ws:')]).toStrictEqual([true, false]);
  });

  it('upgrades insecure requests only in what ships, since dev is served over http', () => {
    expect([directive(true, 'upgrade-insecure-requests'), directive(false, 'upgrade-insecure-requests')]).toStrictEqual(['', 'upgrade-insecure-requests']);
  });
});

describe('what the comments call load-bearing', () => {
  it.each(MODES)('keeps unsafe-inline on script-src in %s, which the inline hydration scripts Start emits need', (_label, dev) => {
    expect(directive(dev, 'script-src')).toContain("'unsafe-inline'");
  });

  it.each(MODES)('keeps unsafe-inline on style-src in %s, for the inline style attributes no hash can cover', (_label, dev) => {
    expect(directive(dev, 'style-src')).toBe("style-src 'self' 'unsafe-inline'");
  });

  it.each(MODES)('keeps data: on img-src and font-src in %s, for whatever Vite inlines next', (_label, dev) => {
    expect([directive(dev, 'img-src'), directive(dev, 'font-src')]).toStrictEqual(["img-src 'self' data:", "font-src 'self' data:"]);
  });

  it.each(MODES)('names challenges.cloudflare.com in both script-src and frame-src in %s', (_label, dev) => {
    expect({
      script: directive(dev, 'script-src').includes('https://challenges.cloudflare.com'),
      frame: directive(dev, 'frame-src').includes('https://challenges.cloudflare.com'),
    }).toStrictEqual({ script: true, frame: true });
  });

  it.each(MODES)('keeps default-src, frame-ancestors, object-src, base-uri and form-action locked down in %s', (_label, dev) => {
    expect([
      directive(dev, 'default-src'),
      directive(dev, 'frame-ancestors'),
      directive(dev, 'object-src'),
      directive(dev, 'base-uri'),
      directive(dev, 'form-action'),
    ]).toStrictEqual(["default-src 'self'", "frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'"]);
  });
});

describe('the header list', () => {
  it.each(MODES)('carries exactly these four headers in %s, each named once', (_label, dev) => {
    const names = securityHeaders(dev).map(([name]) => name);

    expect(names).toStrictEqual(['Content-Security-Policy', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy']);
  });

  it.each(MODES)('pins every value outside the CSP in %s', (_label, dev) => {
    const pairs: [string, string][] = securityHeaders(dev)
      .filter(([name]) => name !== 'Content-Security-Policy')
      .map(([name, value]) => [name, value]);

    expect(pairs).toStrictEqual([
      ['X-Content-Type-Options', 'nosniff'],
      ['Referrer-Policy', 'strict-origin-when-cross-origin'],
      ['Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()'],
    ]);
  });

  it.each(MODES)('leaves X-Frame-Options out in %s, because frame-ancestors supersedes it', (_label, dev) => {
    expect(headerValue(dev, 'X-Frame-Options')).toBe('');
  });
});
