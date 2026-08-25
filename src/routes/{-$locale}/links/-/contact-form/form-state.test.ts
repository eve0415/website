import type { FieldName, FormError } from './form-state';

import { describe, expect, it } from 'vitest';

import { fieldOf, readField } from './form-state';

/**
 * The same `satisfies` guarantee `FIELD_OF` itself carries, restated here: a new
 * `FormError` member with no decision is a compile error in this file too. That
 * check is oxlint's, not vitest's — there is deliberately no runtime assertion
 * for it, because any two lists declared in this file would only agree with
 * each other.
 */
const FIELD_FOR = {
  name: 'name',
  email: 'email',
  message: 'message',
  // The only ceiling a visitor can reach through the form, so it points at the
  // textarea rather than at nothing.
  'too-long': 'message',
  challenge: undefined,
  'rate-limited': undefined,
  'send-failed': undefined,
  network: undefined,
  interactive: undefined,
  pending: undefined,
} satisfies Record<FormError, FieldName | undefined>;

const ROWS: [FormError, FieldName | undefined][] = [
  ['name', FIELD_FOR.name],
  ['email', FIELD_FOR.email],
  ['message', FIELD_FOR.message],
  ['too-long', FIELD_FOR['too-long']],
  ['challenge', FIELD_FOR.challenge],
  ['rate-limited', FIELD_FOR['rate-limited']],
  ['send-failed', FIELD_FOR['send-failed']],
  ['network', FIELD_FOR.network],
  ['interactive', FIELD_FOR.interactive],
  ['pending', FIELD_FOR.pending],
];

describe('fieldOf', () => {
  it.each(ROWS)('points %s at %s', (code, field) => {
    expect(fieldOf(code)).toBe(field);
  });
});

describe('readField', () => {
  it('returns a string entry unchanged', () => {
    const form = new FormData();
    form.set('name', 'Ada Lovelace');

    expect(readField(form, 'name')).toBe('Ada Lovelace');
  });

  it('returns an empty string for a key that is absent', () => {
    expect(readField(new FormData(), 'name')).toBe('');
  });

  it('returns an empty string for an entry that is not a string, which is why it exists', () => {
    const form = new FormData();
    form.set('name', new File(['payload'], 'name.txt', { type: 'text/plain' }));

    expect(readField(form, 'name')).toBe('');
  });
});
