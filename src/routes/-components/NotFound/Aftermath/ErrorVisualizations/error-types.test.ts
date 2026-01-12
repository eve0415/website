import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ERROR_VISUALIZATIONS, getRandomError } from './error-types';

describe('error-types', () => {
  describe('getRandomError', () => {
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
      const result = getRandomError();
      expect(result.type).toBe(expected);
    });

    it('cycles through all 6 error types with consecutive seeds', () => {
      const types = new Set<string>();
      for (let i = 0; i < 6; i++) {
        vi.mocked(Date.now).mockReturnValue(i * 1000);
        types.add(getRandomError().type);
      }
      expect(types.size).toBe(6);
    });

    it('returns consistent result within same second', () => {
      vi.mocked(Date.now).mockReturnValue(1234567);
      const result1 = getRandomError();

      vi.mocked(Date.now).mockReturnValue(1234999);
      const result2 = getRandomError();

      expect(result1).toEqual(result2);
    });

    it('wraps around after 6 seconds', () => {
      vi.mocked(Date.now).mockReturnValue(0);
      const first = getRandomError();

      vi.mocked(Date.now).mockReturnValue(6000);
      const seventh = getRandomError();

      expect(first).toEqual(seventh);
    });
  });

  describe('ERROR_VISUALIZATIONS', () => {
    it('contains exactly 6 error types', () => {
      expect(ERROR_VISUALIZATIONS).toHaveLength(6);
    });

    it('each error has required properties', () => {
      for (const error of ERROR_VISUALIZATIONS) {
        expect(error).toHaveProperty('type');
        expect(error).toHaveProperty('title');
        expect(error).toHaveProperty('subtitle');
        expect(error).toHaveProperty('language');
        expect(error).toHaveProperty('fixAction');
      }
    });

    it('all types are unique', () => {
      const types = ERROR_VISUALIZATIONS.map(e => e.type);
      const uniqueTypes = new Set(types);
      expect(uniqueTypes.size).toBe(types.length);
    });

    it('all fixAction values are Japanese text', () => {
      for (const error of ERROR_VISUALIZATIONS) {
        // Japanese characters are in Unicode range 0x3000-0x9FFF
        expect(error.fixAction).toMatch(/[\u3000-\u9FFF]/);
      }
    });
  });
});
