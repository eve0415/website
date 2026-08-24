import type { ContactFailure, ContactInput } from './validation';

import { describe, expect, it } from 'vitest';

import { EMAIL_MAX, MESSAGE_MAX, NAME_MAX, checkContact, parseContactInput } from './validation';

const VALID = { name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello there.', token: 'turnstile-token' } satisfies ContactInput;

describe('checkContact', () => {
  it('accepts a submission with nothing wrong with it', () => {
    expect(checkContact(VALID)).toBeUndefined();
  });

  it.each([[''], ['   '], ['\t\n']])('refuses a name that is only whitespace (%o)', name => {
    expect(checkContact({ ...VALID, name })).toBe('name');
  });

  it.each([['no-at-sign'], ['no@dot'], ['@example.com'], ['ada@'], ['ada @example.com'], ['ada@exam ple.com'], ['']])('refuses %o as an address', email => {
    expect(checkContact({ ...VALID, email })).toBe('email');
  });

  it.each([['<'], ['>'], ['"'], [','], [';'], [':'], ['\\']])(
    'refuses %o in an address, because it carries meaning in the replyTo header the address becomes',
    character => {
      expect(checkContact({ ...VALID, email: `ada${character}b@example.com` })).toBe('email');
    },
  );

  it.each([[''], ['   '], ['\n']])('refuses a message that is only whitespace (%o)', message => {
    expect(checkContact({ ...VALID, message })).toBe('message');
  });

  it('separates an over-long name from a malformed one', () => {
    expect(checkContact({ ...VALID, name: 'a'.repeat(NAME_MAX + 1) })).toBe('too-long');
  });

  it('separates an over-long message from a malformed one', () => {
    expect(checkContact({ ...VALID, message: 'a'.repeat(MESSAGE_MAX + 1) })).toBe('too-long');
  });

  const precedence: [string, ContactInput, ContactFailure][] = [
    ['the name', { ...VALID, name: '', email: 'no-at-sign', message: '' }, 'name'],
    ['the email', { ...VALID, email: 'no-at-sign', message: '' }, 'email'],
    ['the message', { ...VALID, message: '' }, 'message'],
  ];

  it.each(precedence)('reports %s first, in the order the visitor meets the fields', (_field, input, failure) => {
    expect(checkContact(input)).toBe(failure);
  });

  it('measures the address against its ceiling inside the email step, before the pattern runs', () => {
    // Both halves of EMAIL_PATTERN are the same negated class and both admit
    // `.`, so a long address that cannot match backtracks quadratically — and
    // checkContact runs ahead of the Turnstile challenge and the rate limiter,
    // on input nothing has authenticated yet. The ceiling has to be the email
    // step's own first test: moved down to the `too-long` checks it would let
    // the well-formed case below through as valid, and moved after the pattern
    // it would hand the pathological one to the regex.
    const wellFormedButTooLong = `${'a'.repeat(EMAIL_MAX)}@example.com`;
    const pathological = `a@${'a.'.repeat(16_000)}`;

    expect(checkContact({ ...VALID, email: wellFormedButTooLong })).toBe('email');
    expect(checkContact({ ...VALID, email: pathological })).toBe('email');
  });
});

describe('parseContactInput', () => {
  it('keeps exactly the four fields it declares', () => {
    expect(parseContactInput({ ...VALID, admin: true })).toStrictEqual(VALID);
  });

  const malformed: [string, unknown][] = [
    ['null', null],
    ['undefined', undefined],
    ['a string', 'name=Ada'],
    ['a number', 42],
    ['an array', []],
    ['an empty object', {}],
    ['a missing name', { email: VALID.email, message: VALID.message, token: VALID.token }],
    ['a missing email', { name: VALID.name, message: VALID.message, token: VALID.token }],
    ['a missing message', { name: VALID.name, email: VALID.email, token: VALID.token }],
    ['a missing token', { name: VALID.name, email: VALID.email, message: VALID.message }],
    ['a non-string name', { ...VALID, name: 1 }],
    ['a non-string email', { ...VALID, email: null }],
    ['a non-string message', { ...VALID, message: ['a'] }],
    ['a non-string token', { ...VALID, token: true }],
  ];

  it.each(malformed)('throws on %s, because a malformed payload is not a visitor mistake', (_label, value) => {
    expect(() => parseContactInput(value)).toThrow('Malformed contact submission');
  });
});
