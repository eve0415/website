import type { TurnstileRejection } from '#turnstile/verify';
import type { ContactFailure, ContactResult } from './validation';

import { createServerFn } from '@tanstack/react-start';
import { getRequest, getRequestUrl } from '@tanstack/react-start/server';
import { env } from 'cloudflare:workers';

import { verifyTurnstileToken } from '#turnstile/verify';

import { EMAIL_MAX, NAME_MAX, checkContact, parseContactInput } from './validation';

/** Three sends an hour per address is generous for a personal contact form. */
const MAX_PER_WINDOW = 3;

const WINDOW_SECONDS = 3600;

/**
 * `CF-Connecting-IP` is added by the edge, so it is absent under `vite preview`
 * and `wrangler dev`. Bucketing those under one key is the safe direction:
 * local requests share a budget rather than each getting an unlimited one.
 */
const UNKNOWN_IP = 'unknown';

/**
 * Every control character — not only CR and LF — folded to a single space, so
 * nothing reaching a header can open a second line. `\p{Cc}` rather than an
 * explicit range, which would mean control escapes in the source.
 */
const HEADER_UNSAFE = /\p{Cc}+/gu;

const headerSafe = (value: string, max: number): string => value.replaceAll(HEADER_UNSAFE, ' ').trim().slice(0, max);

type RateVerdict = 'allowed' | 'blocked';

/**
 * A per-address counter in KV that expires on its own rather than carrying a
 * stored timestamp — so the window is "an hour since the last accepted send"
 * rather than a fixed hour, which is stricter and never looser.
 *
 * A KV failure returns `allowed`: an outage on the abuse counter must not eat
 * legitimate mail. Abuse itself still fails closed, because an address already
 * over budget is refused before anything is written.
 */
const rateLimit = async (ip: string): Promise<RateVerdict> => {
  const key = `contact:${ip}`;

  let count = 0;
  try {
    const stored = await env.CONTACT_RATE_LIMIT.get(key);
    if (stored !== null) {
      const parsed = Number(stored);
      if (Number.isInteger(parsed) && parsed > 0) count = parsed;
    }
  } catch {
    return 'allowed';
  }

  if (count >= MAX_PER_WINDOW) return 'blocked';

  try {
    await env.CONTACT_RATE_LIMIT.put(key, String(count + 1), { expirationTtl: WINDOW_SECONDS });
  } catch {
    // The budget missed one tick. Losing the mail would be the worse failure.
  }

  return 'allowed';
};

/**
 * Turnstile's own reason never reaches the visitor — it would tell a probe
 * which check it tripped. `unreachable` and `misconfigured` are this site's
 * fault rather than the visitor's, so they read as "try again" instead of
 * accusing them of failing a challenge they never saw.
 */
const failureFor = (rejection: TurnstileRejection): ContactFailure =>
  rejection === 'unreachable' || rejection === 'misconfigured' ? 'send-failed' : 'challenge';

interface Delivery {
  name: string;
  email: string;
  message: string;
}

const deliver = async (input: Delivery): Promise<ContactResult> => {
  const name = headerSafe(input.name, NAME_MAX);
  const replyTo = headerSafe(input.email, EMAIL_MAX);

  try {
    // The builder overload composes the MIME itself. Its `headers` map is left
    // alone entirely — nothing here needs a custom header, and not having one
    // is one less place for a submitted value to reach a header raw.
    await env.CONTACT_EMAIL.send({
      from: env.CONTACT_MAIL_FROM,
      to: env.CONTACT_MAIL_TO,
      replyTo,
      subject: `[eve0415.net] ${name}`,
      text: `${name} <${replyTo}>\n\n${input.message}`,
    });
  } catch {
    // Deliberately not logged: the failure carries both configured addresses.
    return { ok: false, reason: 'send-failed' };
  }

  return { ok: true };
};

export const sendContact = createServerFn({ method: 'POST' })
  .validator(parseContactInput)
  .handler(async ({ data }): Promise<ContactResult> => {
    const failure = checkContact(data);
    if (failure !== undefined) return { ok: false, reason: failure };

    const remoteIp = getRequest().headers.get('CF-Connecting-IP') ?? UNKNOWN_IP;

    // The host of the request being answered rather than a fixed domain — an
    // allowlist has no entry for a preview deployment's generated hostname.
    // `getRequestUrl().hostname` and not the Host header, which carries a port
    // that siteverify's `hostname` never has.
    const verdict = await verifyTurnstileToken(data.token, remoteIp, getRequestUrl().hostname);
    if (!verdict.ok) return { ok: false, reason: failureFor(verdict.reason) };

    // After the challenge, so an unverified flood cannot burn a real visitor's
    // budget by guessing their address.
    if ((await rateLimit(remoteIp)) === 'blocked') return { ok: false, reason: 'rate-limited' };

    return await deliver(data);
  });
