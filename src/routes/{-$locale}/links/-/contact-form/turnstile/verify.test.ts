import type { TurnstileRejection } from './verify';
import type { Mock } from 'vitest';

import { env } from 'cloudflare:workers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TURNSTILE_ACTION } from './constants';
import { verifyTurnstileToken } from './verify';

/**
 * `verify.ts` keeps everything but `verifyTurnstileToken` to itself, so the whole
 * decision table is driven through the one function and a stubbed global `fetch`.
 * `vi.mock` is a lint error here; `vi.stubGlobal` is what intercepts the bare
 * `fetch` call the module makes, and `unstubGlobals` tears it down per test.
 */

/** The endpoint, the token ceiling and the token lifetime, all private to verify.ts. */
const SITEVERIFY_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const MAX_TOKEN_LENGTH = 2048;
const MAX_TOKEN_AGE_MS = 300_000;

const TOKEN = 'widget-token';
const REMOTE_IP = '203.0.113.9';
const HOSTNAME = 'eve0415.net';

/**
 * Ahead of the real clock, for the same reason `rate-limiter.test.ts` is: pinned to
 * a past instant, anything miniflare has scheduled is already due.
 */
const NOW = new Date('2030-06-01T12:00:00.000Z');

/** A `challenge_ts` for a challenge solved `ageMs` before the fake now. */
const solvedAgo = (ageMs: number) => new Date(NOW.getTime() - ageMs).toISOString();

/** Everything the post-success checks want, so each test spoils exactly one field. */
const PASSING = { success: true, action: TURNSTILE_ACTION, hostname: HOSTNAME, challenge_ts: solvedAgo(0) };

interface SiteverifyRequest {
  readonly method?: string;
  readonly body?: unknown;
}

type SiteverifyImpl = (url: unknown, init?: SiteverifyRequest) => Promise<Response>;
type SiteverifyStub = Mock<SiteverifyImpl>;

const respondJson = (payload: unknown) => () => Response.json(payload);
/**
 * A passing payload behind a failing status, deliberately: with an unreadable body
 * the `!response.ok` guard and the `response.json()` catch are indistinguishable,
 * and deleting the guard changes nothing. This tells them apart.
 */
const respondNotOk = (): Response => Response.json(PASSING, { status: 502 });
const respondNonJson = (): Response => new Response('<html>edge error</html>');
const respondThrow = (): Response => {
  throw new TypeError('network unreachable');
};

/**
 * One entry per call, with the last one repeating — so a single entry is a
 * persistent answer. That matters: every response that leaves `siteverify` with
 * `undefined` is retryable, so the transport and payload failures below all make
 * two calls, and a one-shot stub would answer the second one by accident.
 */
const stubSiteverify = (...responses: readonly (() => Response)[]): SiteverifyStub => {
  let call = 0;

  const stub = vi.fn<SiteverifyImpl>(async () => {
    const respond = responses[Math.min(call, responses.length - 1)];
    call += 1;
    if (respond === undefined) throw new Error('stubSiteverify was given no responses');
    return await Promise.resolve(respond());
  });

  vi.stubGlobal('fetch', stub);
  return stub;
};

const bodyOf = (stub: SiteverifyStub, call: number): FormData => {
  const body = stub.mock.calls[call]?.[1]?.body;
  if (!(body instanceof FormData)) throw new Error(`call ${call} carried no FormData body`);
  return body;
};

const fieldOf = (body: FormData, name: string): string => {
  const value = body.get(name);
  if (typeof value !== 'string') throw new Error(`${name} was not sent as a text field`);
  return value;
};

beforeEach(() => {
  // Only `Date` — `isFresh` is the sole clock reader, and leaving the timer
  // surface real keeps `Response.json()` off the fake queue.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('the token guard', () => {
  it('refuses an empty token without asking siteverify', async () => {
    const stub = stubSiteverify(respondJson(PASSING));

    await expect(verifyTurnstileToken('', REMOTE_IP, HOSTNAME)).resolves.toStrictEqual({ ok: false, reason: 'malformed-token' });
    expect(stub).not.toHaveBeenCalled();
  });

  it('refuses a token one character over the documented ceiling without asking siteverify', async () => {
    const stub = stubSiteverify(respondJson(PASSING));

    await expect(verifyTurnstileToken('t'.repeat(MAX_TOKEN_LENGTH + 1), REMOTE_IP, HOSTNAME)).resolves.toStrictEqual({
      ok: false,
      reason: 'malformed-token',
    });
    expect(stub).not.toHaveBeenCalled();
  });

  it('lets a token of exactly the ceiling through, so the bound stays inclusive', async () => {
    const stub = stubSiteverify(respondJson(PASSING));

    await expect(verifyTurnstileToken('t'.repeat(MAX_TOKEN_LENGTH), REMOTE_IP, HOSTNAME)).resolves.toStrictEqual({ ok: true });
    expect(stub).toHaveBeenCalledTimes(1);
  });
});

describe('what siteverify cannot answer', () => {
  /**
   * A transport failure and an unreadable payload are the same thing to the caller:
   * `siteverify` returns `undefined` either way, which is retryable, so each case
   * here is also the two-failures-in-a-row case — the stub repeats its last answer.
   */
  const unreadable: readonly (readonly [string, () => Response])[] = [
    ['fetch throwing', respondThrow],
    ['a non-OK response', respondNotOk],
    ['a body that is not JSON', respondNonJson],
    ['a null body', respondJson(null)],
    ['a body that is not an object', respondJson('denied')],
    ['a body with no success field', respondJson({ action: TURNSTILE_ACTION, hostname: HOSTNAME })],
    ['a body whose success is not a boolean', respondJson({ success: 'true', hostname: HOSTNAME })],
  ];

  it.each(unreadable)('reports %s as unreachable, after one retry that fails the same way', async (_label, respond) => {
    const stub = stubSiteverify(respond);

    await expect(verifyTurnstileToken(TOKEN, REMOTE_IP, HOSTNAME)).resolves.toStrictEqual({ ok: false, reason: 'unreachable' });
    expect(stub).toHaveBeenCalledTimes(2);
  });
});

describe('the rejection mapping', () => {
  const mappings: readonly (readonly [string, unknown, TurnstileRejection])[] = [
    ['a replayed token', { success: false, 'error-codes': ['timeout-or-duplicate'] }, 'replayed-token'],
    ['a missing secret', { success: false, 'error-codes': ['missing-input-secret'] }, 'misconfigured'],
    ['an invalid secret', { success: false, 'error-codes': ['invalid-input-secret'] }, 'misconfigured'],
    ['any other failing code', { success: false, 'error-codes': ['invalid-input-response'] }, 'invalid-token'],
    ['an empty code list', { success: false, 'error-codes': [] }, 'invalid-token'],
    ['no code list at all', { success: false }, 'invalid-token'],
    ['a code list that is not an array', { success: false, 'error-codes': 'invalid-input-response' }, 'invalid-token'],
    ['a code list of nothing but non-strings', { success: false, 'error-codes': [42, null, { code: 'nope' }] }, 'invalid-token'],
    ['a code list where the strings survive the filter', { success: false, 'error-codes': [42, 'timeout-or-duplicate'] }, 'replayed-token'],
    ['a replay alongside a secret error', { success: false, 'error-codes': ['timeout-or-duplicate', 'invalid-input-secret'] }, 'replayed-token'],
    ['a secret error alongside a replay', { success: false, 'error-codes': ['invalid-input-secret', 'timeout-or-duplicate'] }, 'replayed-token'],
  ];

  it.each(mappings)('maps %s to the matching rejection', async (_label, payload, reason) => {
    stubSiteverify(respondJson(payload));

    await expect(verifyTurnstileToken(TOKEN, REMOTE_IP, HOSTNAME)).resolves.toStrictEqual({ ok: false, reason });
  });
});

describe('the retry', () => {
  it('gives an internal error a second chance, and takes the second answer', async () => {
    const stub = stubSiteverify(respondJson({ success: false, 'error-codes': ['internal-error'] }), respondJson(PASSING));

    await expect(verifyTurnstileToken(TOKEN, REMOTE_IP, HOSTNAME)).resolves.toStrictEqual({ ok: true });
    expect(stub).toHaveBeenCalledTimes(2);
  });

  it('gives a transport failure a second chance too', async () => {
    const stub = stubSiteverify(respondThrow, respondJson(PASSING));

    await expect(verifyTurnstileToken(TOKEN, REMOTE_IP, HOSTNAME)).resolves.toStrictEqual({ ok: true });
    expect(stub).toHaveBeenCalledTimes(2);
  });

  it('does not retry a plain refusal, which would spend a siteverify call on a settled answer', async () => {
    const stub = stubSiteverify(respondJson({ success: false, 'error-codes': ['invalid-input-response'] }), respondJson(PASSING));

    await expect(verifyTurnstileToken(TOKEN, REMOTE_IP, HOSTNAME)).resolves.toStrictEqual({ ok: false, reason: 'invalid-token' });
    expect(stub).toHaveBeenCalledTimes(1);
  });

  it('reuses the one idempotency key, so the retry cannot burn the single-use token itself', async () => {
    const stub = stubSiteverify(respondJson({ success: false, 'error-codes': ['internal-error'] }), respondJson(PASSING));

    await expect(verifyTurnstileToken(TOKEN, REMOTE_IP, HOSTNAME)).resolves.toStrictEqual({ ok: true });
    expect(stub).toHaveBeenCalledTimes(2);

    const first = fieldOf(bodyOf(stub, 0), 'idempotency_key');
    const second = fieldOf(bodyOf(stub, 1), 'idempotency_key');

    expect(second).toBe(first);
  });

  it("mints a fresh key per verification, so siteverify cannot replay one submission's verdict at the next", async () => {
    const stub = stubSiteverify(respondJson(PASSING));

    await expect(verifyTurnstileToken(TOKEN, REMOTE_IP, HOSTNAME)).resolves.toStrictEqual({ ok: true });
    await expect(verifyTurnstileToken(TOKEN, REMOTE_IP, HOSTNAME)).resolves.toStrictEqual({ ok: true });

    expect(fieldOf(bodyOf(stub, 1), 'idempotency_key')).not.toBe(fieldOf(bodyOf(stub, 0), 'idempotency_key'));
  });
});

describe('the request', () => {
  it('posts the token, the caller address and the secret to siteverify', async () => {
    const stub = stubSiteverify(respondJson(PASSING));

    await expect(verifyTurnstileToken(TOKEN, REMOTE_IP, HOSTNAME)).resolves.toStrictEqual({ ok: true });

    expect(stub.mock.calls[0]?.[0]).toBe(SITEVERIFY_ENDPOINT);
    expect(stub.mock.calls[0]?.[1]?.method).toBe('POST');

    const body = bodyOf(stub, 0);
    expect(fieldOf(body, 'response')).toBe(TOKEN);
    expect(fieldOf(body, 'remoteip')).toBe(REMOTE_IP);
    // Round-tripped through FormData rather than compared to the binding directly, so
    // both sides take the same coercion: CI has no `.dev.vars`, and there the absent
    // binding reaches siteverify as the string 'undefined'. One assertion, because a
    // failing `toBe` prints both sides and one of them is the secret.
    const expectedSecret = new FormData();
    expectedSecret.append('secret', env.TURNSTILE_SECRET_KEY);
    expect(body.get('secret')).toBe(expectedSecret.get('secret'));
  });
});

describe('the checks a passing verification still has to survive', () => {
  const actions: readonly (readonly [string, unknown])[] = [
    ['rendered with another action', { ...PASSING, action: 'signup' }],
    ['carrying no action', { success: true, hostname: HOSTNAME, challenge_ts: solvedAgo(0) }],
    ['carrying an action that is not a string', { ...PASSING, action: 42 }],
    ['carrying an action that merely starts with ours', { ...PASSING, action: `${TURNSTILE_ACTION}-elsewhere` }],
  ];

  it.each(actions)('refuses a token %s', async (_label, payload) => {
    stubSiteverify(respondJson(payload));

    await expect(verifyTurnstileToken(TOKEN, REMOTE_IP, HOSTNAME)).resolves.toStrictEqual({ ok: false, reason: 'action-mismatch' });
  });

  const hostnames: readonly (readonly [string, unknown])[] = [
    ['served by another host', { ...PASSING, hostname: 'someone-else.example' }],
    ['carrying no hostname', { success: true, action: TURNSTILE_ACTION, challenge_ts: solvedAgo(0) }],
    ['carrying a hostname that is not a string', { ...PASSING, hostname: 42 }],
    ['served by a host that merely ends with ours', { ...PASSING, hostname: `evil-${HOSTNAME}` }],
  ];

  it.each(hostnames)('refuses a token %s', async (_label, payload) => {
    stubSiteverify(respondJson(payload));

    await expect(verifyTurnstileToken(TOKEN, REMOTE_IP, HOSTNAME)).resolves.toStrictEqual({ ok: false, reason: 'hostname-mismatch' });
  });

  const stamps: readonly (readonly [string, unknown])[] = [
    ['older than the five minute lifetime', { ...PASSING, challenge_ts: solvedAgo(MAX_TOKEN_AGE_MS + 1) }],
    ['solved in the future, which is a clock nobody should trust', { ...PASSING, challenge_ts: solvedAgo(-1000) }],
    ['carrying no timestamp', { success: true, action: TURNSTILE_ACTION, hostname: HOSTNAME }],
    ['carrying a timestamp nothing can parse', { ...PASSING, challenge_ts: 'the other day' }],
    ['carrying a timestamp that is not a string', { ...PASSING, challenge_ts: NOW.getTime() }],
  ];

  it.each(stamps)('refuses a challenge %s', async (_label, payload) => {
    stubSiteverify(respondJson(payload));

    await expect(verifyTurnstileToken(TOKEN, REMOTE_IP, HOSTNAME)).resolves.toStrictEqual({ ok: false, reason: 'stale-token' });
  });

  const fresh: readonly (readonly [string, number])[] = [
    ['solved this instant', 0],
    ['solved exactly on the lifetime boundary', MAX_TOKEN_AGE_MS],
  ];

  it.each(fresh)('accepts a challenge %s', async (_label, ageMs) => {
    stubSiteverify(respondJson({ ...PASSING, challenge_ts: solvedAgo(ageMs) }));

    await expect(verifyTurnstileToken(TOKEN, REMOTE_IP, HOSTNAME)).resolves.toStrictEqual({ ok: true });
  });
});
