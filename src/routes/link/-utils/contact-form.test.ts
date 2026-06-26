import { env } from 'cloudflare:workers';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { buildContactEmail, checkAndIncrementRateLimit, sendContactEmail } from './contact-form';

// mimetext base64-encodes the Subject header (RFC 2047); decode it for assertions
const decodeSubject = (raw: string): string => {
  const match = /Subject: =\?utf-8\?B\?([A-Za-z0-9+/=]+)\?=/.exec(raw);
  const encoded = match?.[1];
  if (!encoded) return '';
  return new TextDecoder().decode(Uint8Array.from(atob(encoded), c => c.codePointAt(0) ?? 0));
};

// Header injection only matters in the header section (before the first blank line);
// the body may legitimately contain the unsanitized name as inert content
const headersOf = (raw: string): string => raw.split(/\r?\n\r?\n/)[0] ?? '';

describe('checkAndIncrementRateLimit', () => {
  const testIp = '192.168.1.100';
  const testKey = `rate:${testIp}`;

  beforeEach(async () => {
    await env.CONTACT_RATE_LIMIT.delete(testKey);
  });

  afterEach(async () => {
    await env.CONTACT_RATE_LIMIT.delete(testKey);
  });

  test('first request: allowed=true, remaining=2', async () => {
    const result = await checkAndIncrementRateLimit(testIp);

    expect(result.allowed).toBeTruthy();
    expect(result.remaining).toBe(2);
  });

  test('second request: allowed=true, remaining=1', async () => {
    await checkAndIncrementRateLimit(testIp);
    const result = await checkAndIncrementRateLimit(testIp);

    expect(result.allowed).toBeTruthy();
    expect(result.remaining).toBe(1);
  });

  test('third request: allowed=true, remaining=0', async () => {
    await checkAndIncrementRateLimit(testIp);
    await checkAndIncrementRateLimit(testIp);
    const result = await checkAndIncrementRateLimit(testIp);

    expect(result.allowed).toBeTruthy();
    expect(result.remaining).toBe(0);
  });

  test('fourth request: allowed=false, remaining=0', async () => {
    await checkAndIncrementRateLimit(testIp);
    await checkAndIncrementRateLimit(testIp);
    await checkAndIncrementRateLimit(testIp);
    const result = await checkAndIncrementRateLimit(testIp);

    expect(result.allowed).toBeFalsy();
    expect(result.remaining).toBe(0);
  });

  test('stores count in KV with correct format', async () => {
    await checkAndIncrementRateLimit(testIp);

    const stored = await env.CONTACT_RATE_LIMIT.get<{ count: number }>(testKey, 'json');
    expect(stored).toStrictEqual({ count: 1 });
  });

  test('increments existing count', async () => {
    await checkAndIncrementRateLimit(testIp);
    await checkAndIncrementRateLimit(testIp);

    const stored = await env.CONTACT_RATE_LIMIT.get<{ count: number }>(testKey, 'json');
    expect(stored).toStrictEqual({ count: 2 });
  });

  test('different IPs have separate rate limits', async () => {
    const ip1 = '10.0.0.1';
    const ip2 = '10.0.0.2';

    try {
      await checkAndIncrementRateLimit(ip1);
      await checkAndIncrementRateLimit(ip1);
      await checkAndIncrementRateLimit(ip1);
      const ip1Result = await checkAndIncrementRateLimit(ip1);

      const ip2Result = await checkAndIncrementRateLimit(ip2);

      expect(ip1Result.allowed).toBeFalsy();
      expect(ip2Result.allowed).toBeTruthy();
      expect(ip2Result.remaining).toBe(2);
    } finally {
      await env.CONTACT_RATE_LIMIT.delete(`rate:${ip1}`);
      await env.CONTACT_RATE_LIMIT.delete(`rate:${ip2}`);
    }
  });

  describe('concurrent requests', () => {
    test('handles 5 concurrent requests correctly', async () => {
      const concurrentIp = '192.168.1.200';
      const concurrentKey = `rate:${concurrentIp}`;

      try {
        const results = await Promise.all([
          checkAndIncrementRateLimit(concurrentIp),
          checkAndIncrementRateLimit(concurrentIp),
          checkAndIncrementRateLimit(concurrentIp),
          checkAndIncrementRateLimit(concurrentIp),
          checkAndIncrementRateLimit(concurrentIp),
        ]);

        const allowedCount = results.filter(r => r.allowed).length;

        expect(allowedCount).toBeGreaterThanOrEqual(1);
        expect(allowedCount).toBeLessThanOrEqual(5);

        const stored = await env.CONTACT_RATE_LIMIT.get<{ count: number }>(concurrentKey, 'json');
        expect(stored?.count).toBeGreaterThanOrEqual(1);
        expect(stored?.count).toBeLessThanOrEqual(5);
      } finally {
        await env.CONTACT_RATE_LIMIT.delete(concurrentKey);
      }
    });
  });
});

describe('sendContactEmail', () => {
  const mockSend = vi.fn<(msg: unknown) => Promise<void>>().mockResolvedValue();

  beforeEach(() => {
    vi.clearAllMocks();
    (env as unknown as Record<string, unknown>)['CONTACT_EMAIL'] = { send: mockSend };
  });

  test('sends to the site owner (MAIL_ADDRESS), not the submitter', async () => {
    await sendContactEmail({ name: 'Test User', email: 'visitor@example.com', message: 'Hello, this is a test.' });

    expect(mockSend).toHaveBeenCalledOnce();
    const sent = mockSend.mock.calls[0]?.[0] as { from: string; to: string } | undefined;
    expect(sent?.from).toBe('noreply@eve0415.net');
    expect(sent?.to).toBe(env.MAIL_ADDRESS);
    expect(sent?.to).not.toBe('visitor@example.com');
  });

  test('includes form data in MIME body', () => {
    const raw = buildContactEmail({ name: 'Test User', email: 'user@example.com', message: 'Hello, this is my message.' });

    expect(raw).toContain('お名前: Test User');
    expect(raw).toContain('メールアドレス: user@example.com');
    expect(raw).toContain('Hello, this is my message.');
  });

  test('sanitizes CRLF in name to prevent header injection', () => {
    const raw = buildContactEmail({ name: 'Evil\r\nBcc: attacker@evil.com\r\nUser', email: 'test@example.com', message: 'Hello' });

    expect(decodeSubject(raw)).toBe('[Contact] Evil Bcc: attacker@evil.com User');
    expect(headersOf(raw)).not.toMatch(/^Bcc:/im);
  });

  test('sanitizes LF in name', () => {
    const raw = buildContactEmail({ name: 'Evil\nBcc: attacker@evil.com', email: 'test@example.com', message: 'Hello' });

    expect(decodeSubject(raw)).toBe('[Contact] Evil Bcc: attacker@evil.com');
    expect(headersOf(raw)).not.toMatch(/^Bcc:/im);
  });

  test('sanitizes CR in name', () => {
    const raw = buildContactEmail({ name: 'Evil\rBcc: attacker@evil.com', email: 'test@example.com', message: 'Hello' });

    expect(decodeSubject(raw)).toBe('[Contact] Evil Bcc: attacker@evil.com');
    expect(headersOf(raw)).not.toMatch(/^Bcc:/im);
  });

  test('handles Japanese characters in the subject', () => {
    const raw = buildContactEmail({
      name: '田中太郎',
      email: 'tanaka@example.com',
      message: 'こんにちは、お問い合わせです。よろしくお願いします。',
    });

    expect(decodeSubject(raw)).toBe('[Contact] 田中太郎');
  });

  test('trims whitespace from form fields', () => {
    const raw = buildContactEmail({ name: '  Padded Name  ', email: '  padded@example.com  ', message: '  Padded message  ' });

    expect(decodeSubject(raw)).toBe('[Contact] Padded Name');
    expect(raw).toContain('お名前: Padded Name');
    expect(raw).toContain('メールアドレス: padded@example.com');
  });

  test('propagates error when send fails', async () => {
    mockSend.mockRejectedValueOnce(new Error('SMTP error'));

    await expect(sendContactEmail({ name: 'Test User', email: 'test@example.com', message: 'Hello' })).rejects.toThrow('SMTP error');
  });
});
