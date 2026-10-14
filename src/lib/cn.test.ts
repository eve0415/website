import type { ClassValue } from 'cn';

import { describe, expect, it } from 'vitest';

import { cn } from './cn';

const CASES: readonly [label: string, inputs: ClassValue[], expected: string][] = [
  ['drops falsy values instead of leaking them into the class list', ['a', undefined, null, false, '', 'b'], 'a b'],
  ['lets the last of two conflicting utilities win', ['p-2', 'p-4'], 'p-4'],
  ["lets a caller-supplied override win over a component's base classes", ['rounded-md bg-red-500', 'bg-blue-500'], 'rounded-md bg-blue-500'],
  ['resolves a shorthand override against two longhand utilities it conflicts with', ['px-2 py-2', 'p-4'], 'p-4'],
  // The signature is `ClassValue[]`, so the object and nested-array forms are part of the contract even with no call site using them today.
  ['keeps the truthy keys of an object form and drops the falsy ones', [{ flex: true, hidden: false }], 'flex'],
  ['flattens a nested array', [['grid', ['gap-2']]], 'grid gap-2'],
  ['resolves two CSS-variable text colours used by the site', ['text-(--ink-title)', 'text-(--ink-ice)'], 'text-(--ink-ice)'],
  ['resolves two arbitrary sizes used by the site', ['size-[3px]', 'size-[7px]'], 'size-[7px]'],
];

describe('cn', () => {
  it.each(CASES)('%s', (_label, inputs, expected) => {
    expect(cn(...inputs)).toBe(expected);
  });
});
