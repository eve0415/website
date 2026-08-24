import { describe, expect, it } from 'vitest';

import { securityHeaders } from '#security-headers';

const headerValue = (dev: boolean, name: string): string => {
  const found = securityHeaders(dev).find(([header]) => header === name);
  return found === undefined ? '' : found[1];
};

const directive = (dev: boolean, name: string): string => {
  const found = headerValue(dev, 'Content-Security-Policy')
    .split('; ')
    .find(part => part === name || part.startsWith(`${name} `));
  return found ?? '';
};

const MODES: [string, boolean][] = [
  ['dev', true],
  ['prod', false],
];

describe('unsafe-eval', () => {
  it('allows it under vite dev, which needs it', () => {
    expect(directive(true, 'script-src')).toContain("'unsafe-eval'");
  });

  it('does not allow it in what ships', () => {
    expect(directive(false, 'script-src')).not.toContain("'unsafe-eval'");
  });
});

describe('Turnstile', () => {
  it.each(MODES)('names challenges.cloudflare.com in both script-src and frame-src in %s', (_label, dev) => {
    expect({
      script: directive(dev, 'script-src').includes('https://challenges.cloudflare.com'),
      frame: directive(dev, 'frame-src').includes('https://challenges.cloudflare.com'),
    }).toStrictEqual({ script: true, frame: true });
  });
});

describe('the directives carrying the weight', () => {
  it.each(MODES)('keeps frame-ancestors, object-src, base-uri and form-action locked down in %s', (_label, dev) => {
    expect({
      frameAncestors: directive(dev, 'frame-ancestors'),
      objectSrc: directive(dev, 'object-src'),
      baseUri: directive(dev, 'base-uri'),
      formAction: directive(dev, 'form-action'),
    }).toStrictEqual({
      frameAncestors: "frame-ancestors 'none'",
      objectSrc: "object-src 'none'",
      baseUri: "base-uri 'self'",
      formAction: "form-action 'self'",
    });
  });

  it('upgrades insecure requests only in what ships, since dev is served over http', () => {
    expect({ dev: directive(true, 'upgrade-insecure-requests'), prod: directive(false, 'upgrade-insecure-requests') }).toStrictEqual({
      dev: '',
      prod: 'upgrade-insecure-requests',
    });
  });
});

describe('the header list', () => {
  it.each(MODES)('names each header once in %s, because it feeds both _headers and the middleware', (_label, dev) => {
    const names = securityHeaders(dev).map(([name]) => name);

    expect(names).toHaveLength(new Set(names).size);
  });

  it.each(MODES)('carries the four headers the site relies on in %s', (_label, dev) => {
    expect(securityHeaders(dev).map(([name]) => name)).toStrictEqual([
      'Content-Security-Policy',
      'X-Content-Type-Options',
      'Referrer-Policy',
      'Permissions-Policy',
    ]);
  });

  it.each(MODES)('leaves X-Frame-Options out in %s, because frame-ancestors supersedes it', (_label, dev) => {
    expect(headerValue(dev, 'X-Frame-Options')).toBe('');
  });
});
