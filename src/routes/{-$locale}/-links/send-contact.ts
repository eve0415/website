import type { TurnstileRejection } from '#turnstile/verify';
import type { ContactRateLimiter } from './contact-rate-limiter';
import type { ContactFailure, ContactResult } from './validation';

import { createServerFn } from '@tanstack/react-start';
import { getRequest, getRequestUrl } from '@tanstack/react-start/server';
import { env } from 'cloudflare:workers';

import { verifyTurnstileToken } from '#turnstile/verify';

import { rateLimitKey } from './rate-limit-key';
import { EMAIL_MAX, NAME_MAX, checkContact, parseContactInput } from './validation';

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

/** `held` is the only one of the three that owes the budget a `release`. */
type Reservation = 'held' | 'blocked' | 'unavailable';

/**
 * Takes a slot from the sender's hourly budget before the mail is attempted, so
 * that submissions arriving together cannot each be allowed on the same count —
 * the object serializes them, which is the whole reason it is not a KV counter.
 *
 * `unavailable` is the limiter itself failing, and it reads as "send it anyway":
 * an outage on the abuse counter must not silently eat legitimate mail. Abuse
 * still fails closed, because a sender already over budget is refused by the
 * object rather than by anything that can be unavailable.
 */
const reserveSlot = async (limiter: DurableObjectStub<ContactRateLimiter>): Promise<Reservation> => {
  try {
    return (await limiter.reserve()) ? 'held' : 'blocked';
  } catch {
    return 'unavailable';
  }
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
    // budget by guessing their address. `rateLimitKey` and not the raw address:
    // an IPv6 host owns a whole /64 and would otherwise get a counter per request.
    const limiter = env.CONTACT_RATE_LIMIT.getByName(rateLimitKey(remoteIp));

    const reservation = await reserveSlot(limiter);
    if (reservation === 'blocked') return { ok: false, reason: 'rate-limited' };

    const result = await deliver(data);

    // A send that never happened must not cost the sender anything, or three
    // retries during a mail outage leave them locked out of a form that has
    // delivered nothing. Only a slot this request actually took is ours to
    // return, and the object caps how often it will take one back.
    if (!result.ok && reservation === 'held') {
      try {
        await limiter.release();
      } catch {
        // The budget keeps a slot it did not need. The mail is already lost;
        // failing the request a second time over the counter helps nobody.
      }
    }

    return result;
  });
