/**
 * Shared by the form and the server function. The client calls it to render an
 * error without a round trip; the server calls it again because the client's
 * answer is not evidence — the RPC endpoint is reachable without the form.
 */

/** Long enough for a full name in either script, short enough to sit in a subject line. */
export const NAME_MAX = 80;

/** The RFC 5321 ceiling for an address. */
export const EMAIL_MAX = 254;

export const MESSAGE_MAX = 4000;

/**
 * Deliberately stricter than the design's `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`: the
 * address is bound for a `replyTo` header, so the characters that carry
 * meaning in one — quotes, angle brackets, comma, semicolon, colon, backslash —
 * are refused here rather than sanitised away downstream.
 */
const EMAIL_PATTERN = /^[^\s@<>",;:\\]+@[^\s@<>",;:\\]+\.[^\s@<>",;:\\]+$/;

/** What the form and the server function pass around. */
export interface ContactInput {
  name: string;
  email: string;
  message: string;
  /** The Turnstile widget's response token. */
  token: string;
}

/**
 * Everything a submission can fail on, including the outcomes only the server
 * can see. The UI maps each to its own localised line.
 */
export type ContactFailure = 'name' | 'email' | 'message' | 'too-long' | 'challenge' | 'rate-limited' | 'send-failed';

export type ContactResult = { ok: true } | { ok: false; reason: ContactFailure };

/**
 * The first thing wrong with a submission, or `undefined` if nothing is.
 *
 * The design shows one `role="alert"` line rather than per-field errors, so the
 * order here is the order the visitor meets the fields — name, then email, then
 * message — and the caller never has to pick between several issues.
 */
export const checkContact = (input: ContactInput): ContactFailure | undefined => {
  if (input.name.trim().length === 0) return 'name';
  // The ceiling is tested before the pattern, not with the other length checks
  // below: the two halves either side of `\.` are the same negated class and
  // both admit `.`, so a long non-matching address backtracks quadratically —
  // 0.4ms at 500 chars, 226ms at 32k. `checkContact` is the first thing
  // `sendContact` runs, ahead of the challenge and the rate limiter, so that
  // cost is unauthenticated. Bounding the length first makes it unreachable.
  if (input.email.length > EMAIL_MAX || !EMAIL_PATTERN.test(input.email)) return 'email';
  if (input.message.trim().length === 0) return 'message';
  if (input.name.length > NAME_MAX || input.message.length > MESSAGE_MAX) return 'too-long';
  return undefined;
};

const isContactInput = (value: unknown): value is ContactInput =>
  typeof value === 'object' &&
  value !== null &&
  'name' in value &&
  typeof value.name === 'string' &&
  'email' in value &&
  typeof value.email === 'string' &&
  'message' in value &&
  typeof value.message === 'string' &&
  'token' in value &&
  typeof value.token === 'string';

/**
 * The structural half of validation, for `createServerFn().validator()`.
 *
 * `.validator()` runs server-only and *throws* on failure, which the handler
 * turns into a 500 — so it can only carry the checks whose failure means a
 * malformed payload rather than a visitor mistake. Everything a person can get
 * wrong is `checkContact`, inside the handler, where it can come back as copy.
 */
export const parseContactInput = (value: unknown): ContactInput => {
  if (!isContactInput(value)) throw new Error('Malformed contact submission');
  return { name: value.name, email: value.email, message: value.message, token: value.token };
};
