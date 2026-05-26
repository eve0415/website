import { env } from 'cloudflare:workers';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test';

import { buildContactEmailRaw, checkAndIncrementRateLimit, sendContactEmail } from './contact-form';

const TEST_MAIL_ADDRESS = 'test@example.com';

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

const decodeSubject = (raw: string): string => {
  const match = raw.match(/Subject: (.+?)(?:\r?\n(?! ))/s);
  if (!match?.[1]) return '';
  const encoded = match[1].replaceAll(/\r?\n\s+/g, '');
  if (encoded.startsWith('=?')) {
    const parts = encoded.match(/[=]\?([^?]+)\?([BQ])\?([^?]+)\?=/i);
    if (parts?.[2]?.toUpperCase() === 'B' && parts[3]) return Buffer.from(parts[3], 'base64').toString(parts[1]);
  }
  return encoded;
};

describe('buildContactEmailRaw', () => {
  test('returns a MIME string with sender address', () => {
    const raw = buildContactEmailRaw({ name: 'Test User', email: 'test@example.com', message: 'Hello' }, TEST_MAIL_ADDRESS);

    expect(raw).toContain('noreply@eve0415.net');
  });

  test('sets correct recipient', () => {
    const raw = buildContactEmailRaw({ name: 'Test User', email: 'test@example.com', message: 'Hello' }, TEST_MAIL_ADDRESS);

    expect(raw).toContain(TEST_MAIL_ADDRESS);
  });

  test('sets subject with name', () => {
    const raw = buildContactEmailRaw({ name: 'Test User', email: 'test@example.com', message: 'Hello' }, TEST_MAIL_ADDRESS);

    expect(decodeSubject(raw)).toBe('[Contact] Test User');
  });

  test('includes form data in body', () => {
    const raw = buildContactEmailRaw({ name: 'Test User', email: 'test@example.com', message: 'Hello, this is my message.' }, TEST_MAIL_ADDRESS);

    expect(raw).toContain('Test User');
    expect(raw).toContain('test@example.com');
    expect(raw).toContain('Hello, this is my message.');
  });

  test('handles Japanese characters in form fields', () => {
    const raw = buildContactEmailRaw(
      { name: '田中太郎', email: 'tanaka@example.com', message: 'こんにちは、お問い合わせです。よろしくお願いします。' },
      TEST_MAIL_ADDRESS,
    );

    const subject = decodeSubject(raw);
    expect(subject).toContain('[Contact]');
    expect(subject).toContain('田中太郎');
  });

  describe('header injection prevention', () => {
    test('sanitizes CRLF in name to prevent header injection', () => {
      const raw = buildContactEmailRaw({ name: 'Evil\r\nBcc: attacker@evil.com\r\nUser', email: 'test@example.com', message: 'Hello' }, TEST_MAIL_ADDRESS);

      expect(decodeSubject(raw)).toBe('[Contact] Evil Bcc: attacker@evil.com User');
    });

    test('sanitizes LF in name', () => {
      const raw = buildContactEmailRaw({ name: 'Evil\nBcc: attacker@evil.com', email: 'test@example.com', message: 'Hello' }, TEST_MAIL_ADDRESS);

      expect(decodeSubject(raw)).toBe('[Contact] Evil Bcc: attacker@evil.com');
    });

    test('sanitizes CR in name', () => {
      const raw = buildContactEmailRaw({ name: 'Evil\rBcc: attacker@evil.com', email: 'test@example.com', message: 'Hello' }, TEST_MAIL_ADDRESS);

      expect(decodeSubject(raw)).toBe('[Contact] Evil Bcc: attacker@evil.com');
    });
  });

  test('trims whitespace from form fields', () => {
    const raw = buildContactEmailRaw({ name: '  Padded Name  ', email: '  padded@example.com  ', message: '  Padded message  ' }, TEST_MAIL_ADDRESS);

    expect(decodeSubject(raw)).toBe('[Contact] Padded Name');
    expect(raw).toContain('Padded Name');
    expect(raw).toContain('padded@example.com');
    expect(raw).toContain('Padded message');
  });
});

describe('sendContactEmail', () => {
  const mockSend = vi.fn<(msg: unknown) => Promise<void>>().mockResolvedValue();

  beforeEach(() => {
    vi.clearAllMocks();
    (env as Record<string, unknown>).CONTACT_EMAIL = { send: mockSend };
  });

  test('calls env.CONTACT_EMAIL.send', async () => {
    await sendContactEmail({ name: 'Test User', email: 'test@example.com', message: 'Hello' });

    expect(mockSend).toHaveBeenCalledOnce();
  });

  test('propagates error when send fails', async () => {
    mockSend.mockRejectedValueOnce(new Error('SMTP error'));

    await expect(sendContactEmail({ name: 'Test User', email: 'test@example.com', message: 'Hello' })).rejects.toThrow('SMTP error');
  });
});
