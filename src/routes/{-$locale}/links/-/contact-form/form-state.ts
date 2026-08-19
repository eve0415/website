import type { ContactFailure } from './validation';

/** Everything the visitor can be told, including what only the server sees. */
export type FormError = ContactFailure | 'pending';

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

/** Which control the visitor has to go back to, where the failure names one. */
export const fieldOf = (code: FormError): FieldName | undefined => {
  if (code === 'name' || code === 'email' || code === 'message') return code;
  if (code === 'too-long') return 'message';
  return undefined;
};

export const readField = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
};
