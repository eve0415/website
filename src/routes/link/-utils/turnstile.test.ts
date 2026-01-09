import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';

import { verifyTurnstile } from './turnstile';

const TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// MSW server setup
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('verifyTurnstile', () => {
  describe('token validation', () => {
    test('returns error for empty token', async () => {
      const result = await verifyTurnstile('', 'secret-key');

      expect(result.success).toBe(false);
      expect(result.error).toBe('認証トークンが無効です');
    });

    test('returns error for token over 2048 characters', async () => {
      const result = await verifyTurnstile('a'.repeat(2049), 'secret-key');

      expect(result.success).toBe(false);
      expect(result.error).toBe('認証トークンが無効です');
    });

    test('accepts token exactly 2048 characters', async () => {
      server.use(
        http.post(TURNSTILE_URL, () => {
          return HttpResponse.json({ success: true, hostname: 'eve0415.net' });
        }),
      );

      const result = await verifyTurnstile('a'.repeat(2048), 'secret-key');

      expect(result.success).toBe(true);
    });
  });

  describe('success cases', () => {
    test('returns success for valid response with allowed hostname eve0415.net', async () => {
      server.use(
        http.post(TURNSTILE_URL, () => {
          return HttpResponse.json({
            success: true,
            hostname: 'eve0415.net',
            challenge_ts: '2024-01-01T00:00:00Z',
          });
        }),
      );

      const result = await verifyTurnstile('valid-token', 'secret-key');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('returns success for valid response with allowed hostname www.eve0415.net', async () => {
      server.use(
        http.post(TURNSTILE_URL, () => {
          return HttpResponse.json({
            success: true,
            hostname: 'www.eve0415.net',
          });
        }),
      );

      const result = await verifyTurnstile('valid-token', 'secret-key');

      expect(result.success).toBe(true);
    });

    test('returns success for valid response with allowed hostname localhost', async () => {
      server.use(
        http.post(TURNSTILE_URL, () => {
          return HttpResponse.json({
            success: true,
            hostname: 'localhost',
          });
        }),
      );

      const result = await verifyTurnstile('valid-token', 'secret-key');

      expect(result.success).toBe(true);
    });

    test('returns success when no hostname is provided in response', async () => {
      server.use(
        http.post(TURNSTILE_URL, () => {
          return HttpResponse.json({ success: true });
        }),
      );

      const result = await verifyTurnstile('valid-token', 'secret-key');

      expect(result.success).toBe(true);
    });
  });

  describe('hostname validation', () => {
    test('returns error for mismatched hostname', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      server.use(
        http.post(TURNSTILE_URL, () => {
          return HttpResponse.json({
            success: true,
            hostname: 'malicious-site.com',
          });
        }),
      );

      const result = await verifyTurnstile('valid-token', 'secret-key');

      expect(result.success).toBe(false);
      expect(result.error).toBe('認証に失敗しました。もう一度お試しください。');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Turnstile hostname mismatch: expected one of eve0415.net, www.eve0415.net, localhost, got malicious-site.com',
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('error code mapping', () => {
    test('returns timeout message for timeout-or-duplicate error', async () => {
      server.use(
        http.post(TURNSTILE_URL, () => {
          return HttpResponse.json({
            success: false,
            'error-codes': ['timeout-or-duplicate'],
          });
        }),
      );

      const result = await verifyTurnstile('valid-token', 'secret-key');

      expect(result.success).toBe(false);
      expect(result.error).toBe('認証がタイムアウトしました。ページを再読み込みしてください。');
    });

    test('returns invalid token message for invalid-input-response error', async () => {
      server.use(
        http.post(TURNSTILE_URL, () => {
          return HttpResponse.json({
            success: false,
            'error-codes': ['invalid-input-response'],
          });
        }),
      );

      const result = await verifyTurnstile('valid-token', 'secret-key');

      expect(result.success).toBe(false);
      expect(result.error).toBe('認証トークンが無効です。もう一度お試しください。');
    });

    test('returns generic error for unknown error code', async () => {
      server.use(
        http.post(TURNSTILE_URL, () => {
          return HttpResponse.json({
            success: false,
            'error-codes': ['some-unknown-error'],
          });
        }),
      );

      const result = await verifyTurnstile('valid-token', 'secret-key');

      expect(result.success).toBe(false);
      expect(result.error).toBe('認証に失敗しました。もう一度お試しください。');
    });

    test('returns generic error when no error codes provided', async () => {
      server.use(
        http.post(TURNSTILE_URL, () => {
          return HttpResponse.json({ success: false });
        }),
      );

      const result = await verifyTurnstile('valid-token', 'secret-key');

      expect(result.success).toBe(false);
      expect(result.error).toBe('認証に失敗しました。もう一度お試しください。');
    });

    test('returns generic error for empty error codes array', async () => {
      server.use(
        http.post(TURNSTILE_URL, () => {
          return HttpResponse.json({
            success: false,
            'error-codes': [],
          });
        }),
      );

      const result = await verifyTurnstile('valid-token', 'secret-key');

      expect(result.success).toBe(false);
      expect(result.error).toBe('認証に失敗しました。もう一度お試しください。');
    });

    test('prioritizes timeout-or-duplicate over other errors when multiple present', async () => {
      server.use(
        http.post(TURNSTILE_URL, () => {
          return HttpResponse.json({
            success: false,
            'error-codes': ['invalid-input-response', 'timeout-or-duplicate'],
          });
        }),
      );

      const result = await verifyTurnstile('valid-token', 'secret-key');

      expect(result.success).toBe(false);
      expect(result.error).toBe('認証がタイムアウトしました。ページを再読み込みしてください。');
    });
  });

  describe('network failure', () => {
    test('returns connection error when fetch throws', async () => {
      // Stop MSW from intercepting this request so we can mock fetch directly
      server.close();

      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      try {
        const result = await verifyTurnstile('valid-token', 'secret-key');

        expect(result.success).toBe(false);
        expect(result.error).toBe('認証サーバーへの接続に失敗しました。');
      } finally {
        globalThis.fetch = originalFetch;
        server.listen({ onUnhandledRequest: 'bypass' });
      }
    });
  });

  describe('remoteIp parameter', () => {
    test('includes remoteip in form data when provided', async () => {
      let capturedFormData: FormData | null = null;

      server.use(
        http.post(TURNSTILE_URL, async ({ request }) => {
          capturedFormData = await request.formData();
          return HttpResponse.json({ success: true, hostname: 'eve0415.net' });
        }),
      );

      await verifyTurnstile('valid-token', 'secret-key', '192.168.1.1');

      expect(capturedFormData).not.toBeNull();
      expect(capturedFormData!.get('secret')).toBe('secret-key');
      expect(capturedFormData!.get('response')).toBe('valid-token');
      expect(capturedFormData!.get('remoteip')).toBe('192.168.1.1');
    });

    test('omits remoteip from form data when not provided', async () => {
      let capturedFormData: FormData | null = null;

      server.use(
        http.post(TURNSTILE_URL, async ({ request }) => {
          capturedFormData = await request.formData();
          return HttpResponse.json({ success: true, hostname: 'eve0415.net' });
        }),
      );

      await verifyTurnstile('valid-token', 'secret-key');

      expect(capturedFormData).not.toBeNull();
      expect(capturedFormData!.get('secret')).toBe('secret-key');
      expect(capturedFormData!.get('response')).toBe('valid-token');
      expect(capturedFormData!.has('remoteip')).toBe(false);
    });
  });
});
