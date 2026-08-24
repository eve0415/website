import type { ClassValue } from 'clsx';

import { describe, expect, it } from 'vitest';

import { cn } from './cn';

const CASES: readonly [label: string, inputs: ClassValue[], expected: string][] = [
  ['drops falsy values instead of leaking them into the class list', ['a', undefined, null, false, '', 'b'], 'a b'],
  ['lets the last of two conflicting utilities win', ['p-2', 'p-4'], 'p-4'],
  ["lets a caller-supplied override win over a component's base classes", ['rounded-md bg-red-500', 'bg-blue-500'], 'rounded-md bg-blue-500'],
  ['resolves a shorthand override against two longhand utilities it conflicts with', ['px-2 py-2', 'p-4'], 'p-4'],
];

describe('cn', () => {
  it.each(CASES)('%s', (_label, inputs, expected) => {
    expect(cn(...inputs)).toBe(expected);
  });
});
