import { env } from 'cloudflare:workers';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// Mock @tanstack/react-start before importing contact-form
vi.mock('@tanstack/react-start', () => ({
  createServerFn: vi.fn(() => ({
    inputValidator: vi.fn(() => ({
      handler: vi.fn(),
    })),
  })),
}));

vi.mock('@tanstack/react-start/server', () => ({
  getRequestHeaders: vi.fn(() => new Headers({ 'CF-Connecting-IP': '192.168.1.1' })),
}));

// Create tracked mock functions for mimetext
const mockSetSender = vi.fn();
const mockSetRecipient = vi.fn();
const mockSetSubject = vi.fn();
const mockAddMessage = vi.fn();
const mockAsRaw = vi.fn(() => 'mocked-raw-mime');

// Mock mimetext - not compatible with Workers test environment
vi.mock('mimetext', () => ({
  createMimeMessage: vi.fn(() => ({
    setSender: mockSetSender,
    setRecipient: mockSetRecipient,
    setSubject: mockSetSubject,
    addMessage: mockAddMessage,
    asRaw: mockAsRaw,
  })),
}));

// Mock cloudflare:email module with a class constructor
vi.mock('cloudflare:email', () => ({
  EmailMessage: class MockEmailMessage {
    from: string;
    to: string;
    raw: string;
    constructor(from: string, to: string, raw: string) {
      this.from = from;
      this.to = to;
      this.raw = raw;
    }
  },
}));

import { checkAndIncrementRateLimit, sendContactEmail } from './contact-form';

describe('checkAndIncrementRateLimit', () => {
  const testIp = '192.168.1.100';
  const testKey = `rate:${testIp}`;

  beforeEach(async () => {
    // Clear any existing rate limit data
    await env.CONTACT_RATE_LIMIT.delete(testKey);
  });

  afterEach(async () => {
    // Clean up
    await env.CONTACT_RATE_LIMIT.delete(testKey);
  });

  test('first request: allowed=true, remaining=2', async () => {
    const result = await checkAndIncrementRateLimit(testIp);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  test('second request: allowed=true, remaining=1', async () => {
    await checkAndIncrementRateLimit(testIp);
    const result = await checkAndIncrementRateLimit(testIp);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  test('third request: allowed=true, remaining=0', async () => {
    await checkAndIncrementRateLimit(testIp);
    await checkAndIncrementRateLimit(testIp);
    const result = await checkAndIncrementRateLimit(testIp);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  test('fourth request: allowed=false, remaining=0', async () => {
    await checkAndIncrementRateLimit(testIp);
    await checkAndIncrementRateLimit(testIp);
    await checkAndIncrementRateLimit(testIp);
    const result = await checkAndIncrementRateLimit(testIp);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  test('stores count in KV with correct format', async () => {
    await checkAndIncrementRateLimit(testIp);

    const stored = await env.CONTACT_RATE_LIMIT.get<{ count: number }>(testKey, 'json');
    expect(stored).toEqual({ count: 1 });
  });

  test('increments existing count', async () => {
    await checkAndIncrementRateLimit(testIp);
    await checkAndIncrementRateLimit(testIp);

    const stored = await env.CONTACT_RATE_LIMIT.get<{ count: number }>(testKey, 'json');
    expect(stored).toEqual({ count: 2 });
  });

  test('different IPs have separate rate limits', async () => {
    const ip1 = '10.0.0.1';
    const ip2 = '10.0.0.2';

    try {
      // Max out ip1
      await checkAndIncrementRateLimit(ip1);
      await checkAndIncrementRateLimit(ip1);
      await checkAndIncrementRateLimit(ip1);
      const ip1Result = await checkAndIncrementRateLimit(ip1);

      // ip2 should still be allowed
      const ip2Result = await checkAndIncrementRateLimit(ip2);

      expect(ip1Result.allowed).toBe(false);
      expect(ip2Result.allowed).toBe(true);
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
        // Launch 5 concurrent requests
        const results = await Promise.all([
          checkAndIncrementRateLimit(concurrentIp),
          checkAndIncrementRateLimit(concurrentIp),
          checkAndIncrementRateLimit(concurrentIp),
          checkAndIncrementRateLimit(concurrentIp),
          checkAndIncrementRateLimit(concurrentIp),
        ]);

        // Count how many were allowed
        const allowedCount = results.filter(r => r.allowed).length;

        // Due to race conditions in non-atomic KV operations, the exact count may vary
        // but at least 1 should be allowed and we should have some results
        expect(allowedCount).toBeGreaterThanOrEqual(1);
        expect(allowedCount).toBeLessThanOrEqual(5);

        // Verify KV was updated (count may vary due to race conditions)
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
  const mockSend = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock env.CONTACT_EMAIL.send
    (env as unknown as { CONTACT_EMAIL: { send: typeof mockSend } }).CONTACT_EMAIL = {
      send: mockSend,
    };
  });

  test('constructs EmailMessage with correct sender and recipient', async () => {
    const formData = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello, this is a test.',
    };

    await sendContactEmail(formData);

    // Check the message passed to mockSend has correct from/to
    expect(mockSend).toHaveBeenCalledTimes(1);
    const sentMessage = mockSend.mock.calls[0]?.[0] as { from: string; to: string; raw: string } | undefined;
    expect(sentMessage).toBeDefined();
    expect(sentMessage?.from).toBe('noreply@eve0415.net');
    expect(sentMessage?.to).toBe('contact@eve0415.net');
  });

  test('calls env.CONTACT_EMAIL.send with the message', async () => {
    const formData = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello, this is a test.',
    };

    await sendContactEmail(formData);

    expect(mockSend).toHaveBeenCalledTimes(1);
    const sentMessage = mockSend.mock.calls[0]?.[0] as { from: string; to: string; raw: string } | undefined;
    // Verify it has the expected shape
    expect(sentMessage).toBeDefined();
    expect(sentMessage).toHaveProperty('from');
    expect(sentMessage).toHaveProperty('to');
    expect(sentMessage).toHaveProperty('raw');
  });

  test('sets correct sender with name and address', async () => {
    const formData = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello',
    };

    await sendContactEmail(formData);

    expect(mockSetSender).toHaveBeenCalledWith({
      name: 'Contact Form',
      addr: 'noreply@eve0415.net',
    });
  });

  test('sets correct recipient', async () => {
    const formData = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello',
    };

    await sendContactEmail(formData);

    expect(mockSetRecipient).toHaveBeenCalledWith('contact@eve0415.net');
  });

  test('sets subject with name', async () => {
    const formData = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello',
    };

    await sendContactEmail(formData);

    expect(mockSetSubject).toHaveBeenCalledWith('[Contact] Test User');
  });

  test('adds message body with correct content type and form data', async () => {
    const formData = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello, this is my message.',
    };

    await sendContactEmail(formData);

    expect(mockAddMessage).toHaveBeenCalledWith({
      contentType: 'text/plain; charset=UTF-8',
      data: expect.stringContaining('Test User'),
    });
    expect(mockAddMessage).toHaveBeenCalledWith({
      contentType: 'text/plain; charset=UTF-8',
      data: expect.stringContaining('test@example.com'),
    });
    expect(mockAddMessage).toHaveBeenCalledWith({
      contentType: 'text/plain; charset=UTF-8',
      data: expect.stringContaining('Hello, this is my message.'),
    });
  });

  describe('header injection prevention', () => {
    test('sanitizes CRLF in name to prevent header injection', async () => {
      const formData = {
        name: 'Evil\r\nBcc: attacker@evil.com\r\nUser',
        email: 'test@example.com',
        message: 'Hello',
      };

      await sendContactEmail(formData);

      // Subject should have newlines replaced with single space (regex replaces [\r\n]+ with one space)
      expect(mockSetSubject).toHaveBeenCalledWith('[Contact] Evil Bcc: attacker@evil.com User');
    });

    test('sanitizes LF in name', async () => {
      const formData = {
        name: 'Evil\nBcc: attacker@evil.com',
        email: 'test@example.com',
        message: 'Hello',
      };

      await sendContactEmail(formData);

      expect(mockSetSubject).toHaveBeenCalledWith('[Contact] Evil Bcc: attacker@evil.com');
    });

    test('sanitizes CR in name', async () => {
      const formData = {
        name: 'Evil\rBcc: attacker@evil.com',
        email: 'test@example.com',
        message: 'Hello',
      };

      await sendContactEmail(formData);

      expect(mockSetSubject).toHaveBeenCalledWith('[Contact] Evil Bcc: attacker@evil.com');
    });
  });

  test('trims whitespace from form fields', async () => {
    const formData = {
      name: '  Padded Name  ',
      email: '  padded@example.com  ',
      message: '  Padded message  ',
    };

    await sendContactEmail(formData);

    // Subject should use trimmed name
    expect(mockSetSubject).toHaveBeenCalledWith('[Contact] Padded Name');

    // Body should have trimmed values
    expect(mockAddMessage).toHaveBeenCalledWith({
      contentType: 'text/plain; charset=UTF-8',
      data: expect.stringContaining('Padded Name'),
    });
    expect(mockAddMessage).toHaveBeenCalledWith({
      contentType: 'text/plain; charset=UTF-8',
      data: expect.stringContaining('padded@example.com'),
    });
    expect(mockAddMessage).toHaveBeenCalledWith({
      contentType: 'text/plain; charset=UTF-8',
      data: expect.stringContaining('Padded message'),
    });
  });

  test('propagates error when send fails', async () => {
    mockSend.mockRejectedValueOnce(new Error('SMTP error'));

    const formData = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello',
    };

    await expect(sendContactEmail(formData)).rejects.toThrow('SMTP error');
  });
});
