import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ERROR_TYPES, getRandomErrorType } from './error-types';

describe('error-types', () => {
  describe('getRandomErrorType', () => {
    beforeEach(() => {
      vi.spyOn(Date, 'now');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it.each([
      { seed: 0, expected: 'null-pointer' },
      { seed: 1, expected: 'stack-overflow' },
      { seed: 2, expected: 'file-not-found' },
      { seed: 3, expected: 'seg-fault' },
      { seed: 4, expected: 'out-of-memory' },
      { seed: 5, expected: 'index-out-of-bounds' },
    ])('seed $seed returns $expected', ({ seed, expected }) => {
      vi.mocked(Date.now).mockReturnValue(seed * 1000);
      expect(getRandomErrorType()).toBe(expected);
    });

    it('always returns a member of ERROR_TYPES', () => {
      vi.mocked(Date.now).mockReturnValue(1234567);
      expect(ERROR_TYPES).toContain(getRandomErrorType());
    });

    it('cycles through all 18 error types with consecutive seeds', () => {
      const types = new Set<string>();
      for (let i = 0; i < 18; i++) {
        vi.mocked(Date.now).mockReturnValue(i * 1000);
        types.add(getRandomErrorType());
      }
      expect(types.size).toBe(18);
    });

    it('returns consistent result within same second', () => {
      vi.mocked(Date.now).mockReturnValue(1234567);
      const result1 = getRandomErrorType();

      vi.mocked(Date.now).mockReturnValue(1234999);
      const result2 = getRandomErrorType();

      expect(result1).toBe(result2);
    });

    it('wraps around after 18 seconds', () => {
      vi.mocked(Date.now).mockReturnValue(0);
      const first = getRandomErrorType();

      vi.mocked(Date.now).mockReturnValue(18000);
      const nineteenth = getRandomErrorType();

      expect(first).toBe(nineteenth);
    });
  });

  describe('eRROR_TYPES', () => {
    it('contains exactly 18 error types', () => {
      expect(ERROR_TYPES).toHaveLength(18);
    });

    it('all types are unique', () => {
      const uniqueTypes = new Set(ERROR_TYPES);
      expect(uniqueTypes.size).toBe(ERROR_TYPES.length);
    });
  });
});
