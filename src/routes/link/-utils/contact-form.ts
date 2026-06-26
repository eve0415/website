import type { ContactFormData, ValidationErrors } from './validation';

import { createServerFn, createServerOnlyFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { EmailMessage } from 'cloudflare:email';
import { env } from 'cloudflare:workers';
import { createMimeMessage } from 'mimetext';

import { verifyTurnstile } from './turnstile';
import { hasErrors, validateContactForm } from './validation';

// Rate limit constants
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_SECONDS = 3600; // 1 hour

// Email configuration
const SENDER_ADDRESS = 'noreply@eve0415.net';

export type ContactFormResult =
  | { success: true }
  | { success: false; error: 'validation'; errors: ValidationErrors }
  | { success: false; error: 'turnstile'; message: string }
  | { success: false; error: 'rate_limit'; message: string }
  | { success: false; error: 'email_failed'; message: string };

// Form submission handler for progressive enhancement
export const handleForm = createServerFn({ method: 'POST' })
  // oxlint-disable-next-line typescript/no-deprecated -- inputValidator removal requires TanStack Start upgrade
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error('Invalid form data');

    return data;
  })
  .handler(async ({ data: formData }): Promise<ContactFormResult> => {
    // 1. Parse form data (FormData.get returns string | File | null, but these are text fields)
    const readTextField = (key: string): string => {
      const value = formData.get(key);
      return typeof value === 'string' ? value : '';
    };

    const name = readTextField('name');
    const email = readTextField('email');
    const message = readTextField('message');
    const turnstileToken = readTextField('turnstileToken');

    // 2. Server-side validation
    const validationErrors = validateContactForm({ name, email, message });
    if (hasErrors(validationErrors)) return { success: false, error: 'validation', errors: validationErrors };

    // 3. Get client IP from request headers
    const headers = getRequestHeaders();
    const clientIp = headers.get('CF-Connecting-IP') ?? 'unknown';

    // 4. Verify Turnstile token
    if (!turnstileToken) return { success: false, error: 'turnstile', message: 'セキュリティ認証を完了してください' };

    const turnstileSecretKey = env.TURNSTILE_SECRET_KEY;
    const turnstileResult = await verifyTurnstile(turnstileToken, turnstileSecretKey, clientIp);
    if (!turnstileResult.success) {
      return {
        success: false,
        error: 'turnstile',
        message: turnstileResult.error ?? '認証に失敗しました',
      };
    }

    // 5. Check and increment rate limit atomically
    const rateLimitResult = await checkAndIncrementRateLimit(clientIp);
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: 'rate_limit',
        message: 'メッセージの送信制限に達しました（1時間に3回まで）。Discord または X でお問い合わせください。',
      };
    }

    // 6. Send email
    try {
      await sendContactEmail({ name, email, message });
    } catch (error) {
      console.error('Email send failed:', error);
      return {
        success: false,
        error: 'email_failed',
        message: 'メールの送信に失敗しました。Discord または X でお問い合わせください。',
      };
    }

    return { success: true };
  });

/**
 * Best-effort rate limiting via KV read-modify-write.
 * KV has no atomic increment, so concurrent requests can race past the
 * limit. Acceptable for a Turnstile-gated 3/hour contact form.
 * @internal Exported for testing purposes only
 */
export const checkAndIncrementRateLimit = createServerOnlyFn(async (ip: string) => {
  const kv = env.CONTACT_RATE_LIMIT;
  const key = `rate:${ip}`;

  const data = await kv.get<{ count: number }>(key, 'json');
  const currentCount = data?.count ?? 0;
  const newCount = currentCount + 1;

  // Write back immediately to shrink (not eliminate) the race window
  await kv.put(key, JSON.stringify({ count: newCount }), {
    expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
  });

  return {
    allowed: newCount <= RATE_LIMIT_MAX,
    remaining: Math.max(0, RATE_LIMIT_MAX - newCount),
  };
});

/**
 * Build the raw MIME message for a contact submission.
 * @internal Exported for testing
 */
export const buildContactEmail = createServerOnlyFn((formData: ContactFormData): string => {
  const msg = createMimeMessage();
  msg.setSender({ name: 'Contact Form', addr: SENDER_ADDRESS });
  msg.setRecipient(env.MAIL_ADDRESS);

  const safeSubjectName = formData.name.trim().replaceAll(/[\r\n]+/g, ' ');
  msg.setSubject(`[Contact] ${safeSubjectName}`);

  const body = `お名前: ${formData.name.trim()}
メールアドレス: ${formData.email.trim()}

メッセージ:
${formData.message.trim()}`;

  msg.addMessage({
    contentType: 'text/plain',
    data: body,
  });

  return msg.asRaw();
});

/** @internal Exported for testing */
export const sendContactEmail = createServerOnlyFn(async (formData: ContactFormData) => {
  const message = new EmailMessage(SENDER_ADDRESS, env.MAIL_ADDRESS, buildContactEmail(formData));

  await env.CONTACT_EMAIL.send(message);
});
