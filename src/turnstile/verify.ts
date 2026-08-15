import { env } from 'cloudflare:workers';

import { TURNSTILE_ACTION } from '#turnstile/constants';

const SITEVERIFY_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** Cloudflare issues tokens with a five minute lifetime. */
const MAX_TOKEN_AGE_MS = 300_000;

/** Turnstile tokens are documented as up to 2048 characters. */
const MAX_TOKEN_LENGTH = 2048;

export type TurnstileRejection =
  | 'malformed-token'
  | 'unreachable'
  | 'invalid-token'
  | 'replayed-token'
  | 'stale-token'
  | 'action-mismatch'
  | 'hostname-mismatch'
  | 'misconfigured';

export type TurnstileVerdict = { ok: true } | { ok: false; reason: TurnstileRejection };

interface SiteverifyOutcome {
  success: boolean;
  action: string | undefined;
  hostname: string | undefined;
  challengeTs: string | undefined;
  errorCodes: readonly string[];
}

const readOutcome = (payload: unknown): SiteverifyOutcome | undefined => {
  if (typeof payload !== 'object' || payload === null) return undefined;
  if (!('success' in payload) || typeof payload.success !== 'boolean') return undefined;

  const rawCodes = 'error-codes' in payload ? payload['error-codes'] : undefined;

  return {
    success: payload.success,
    action: 'action' in payload && typeof payload.action === 'string' ? payload.action : undefined,
    hostname: 'hostname' in payload && typeof payload.hostname === 'string' ? payload.hostname : undefined,
    challengeTs: 'challenge_ts' in payload && typeof payload.challenge_ts === 'string' ? payload.challenge_ts : undefined,
    errorCodes: Array.isArray(rawCodes) ? rawCodes.filter(code => typeof code === 'string') : [],
  };
};

const siteverify = async (token: string, remoteIp: string, idempotencyKey: string): Promise<SiteverifyOutcome | undefined> => {
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET_KEY);
  form.append('response', token);
  form.append('remoteip', remoteIp);
  form.append('idempotency_key', idempotencyKey);

  try {
    const response = await fetch(SITEVERIFY_ENDPOINT, { method: 'POST', body: form });
    if (!response.ok) return undefined;

    const payload: unknown = await response.json();
    return readOutcome(payload);
  } catch {
    return undefined;
  }
};

/** Only a transport failure or an explicit `internal-error` is worth a second call. */
const isRetryable = (outcome: SiteverifyOutcome | undefined): boolean =>
  outcome === undefined || (!outcome.success && outcome.errorCodes.includes('internal-error'));

const rejectionFor = (errorCodes: readonly string[]): TurnstileRejection => {
  if (errorCodes.includes('timeout-or-duplicate')) return 'replayed-token';
  if (errorCodes.includes('missing-input-secret') || errorCodes.includes('invalid-input-secret')) return 'misconfigured';
  return 'invalid-token';
};

const isFresh = (challengeTs: string | undefined): boolean => {
  if (challengeTs === undefined) return false;

  const solvedAt = Date.parse(challengeTs);
  if (Number.isNaN(solvedAt)) return false;

  const age = Date.now() - solvedAt;
  return age >= 0 && age <= MAX_TOKEN_AGE_MS;
};

/**
 * Exchanges a widget token for a verdict, refusing everything the API gives us
 * to refuse: the solved-challenge timestamp, the action the widget was rendered
 * with, and the hostname that served the challenge.
 *
 * `expectedHostname` is the host of the request being protected rather than a
 * fixed allowlist — an allowlist rejects preview deployments, whose hostnames
 * are not known ahead of time, while this still refuses a token minted for
 * another site.
 *
 * `remoteIp` is required rather than optional: binding the token to the address
 * that solved it is what stops one being harvested and replayed from elsewhere
 * inside its lifetime.
 *
 * The idempotency key is generated once and reused across the retry, so a
 * retried call cannot itself burn the single-use token.
 */
export const verifyTurnstileToken = async (token: string, remoteIp: string, expectedHostname: string): Promise<TurnstileVerdict> => {
  if (token.length === 0 || token.length > MAX_TOKEN_LENGTH) return { ok: false, reason: 'malformed-token' };

  const idempotencyKey = crypto.randomUUID();
  const first = await siteverify(token, remoteIp, idempotencyKey);
  const outcome = isRetryable(first) ? await siteverify(token, remoteIp, idempotencyKey) : first;

  if (outcome === undefined) return { ok: false, reason: 'unreachable' };
  if (!outcome.success) return { ok: false, reason: rejectionFor(outcome.errorCodes) };

  if (outcome.action !== TURNSTILE_ACTION) return { ok: false, reason: 'action-mismatch' };
  if (outcome.hostname !== expectedHostname) return { ok: false, reason: 'hostname-mismatch' };
  if (!isFresh(outcome.challengeTs)) return { ok: false, reason: 'stale-token' };

  return { ok: true };
};
