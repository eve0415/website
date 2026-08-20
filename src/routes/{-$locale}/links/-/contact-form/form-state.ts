import type { ContactFailure } from './validation';

/**
 * Everything the visitor can be told, including what only the server sees.
 *
 * `pending` and `network` are the two the server never returns: one is the
 * challenge not having finished, the other is the request never having arrived.
 */
export type FormError = ContactFailure | 'network' | 'pending';

/** The three controls a failure can be pinned to; the rest are about the submission. */
export type FieldName = 'name' | 'email' | 'message';

/**
 * The failure, plus which attempt produced it. A live region announces a
 * *change*, so the same mistake made twice in a row used to be announced once —
 * the sequence number is what makes the second one a new node with new content.
 */
export interface FormFailure {
  code: FormError;
  seq: number;
}

/**
 * Which control the visitor has to go back to, where the failure names one.
 *
 * A lookup rather than a chain of conditions so the table is exhaustive: adding
 * a member to `FormError` without deciding where it points is then a compile
 * error rather than a silent `undefined`, which is the same guarantee the error
 * copy in `index.tsx` already gets from `satisfies Record<FormError, string>`.
 */
const FIELD_OF = {
  name: 'name',
  email: 'email',
  message: 'message',
  // The only length the visitor can actually exceed through the form: the name
  // and email controls carry `maxLength`, the textarea reports its own count.
  'too-long': 'message',
  challenge: undefined,
  'rate-limited': undefined,
  'send-failed': undefined,
  network: undefined,
  pending: undefined,
} satisfies Record<FormError, FieldName | undefined>;

export const fieldOf = (code: FormError): FieldName | undefined => FIELD_OF[code];

export const readField = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
};
