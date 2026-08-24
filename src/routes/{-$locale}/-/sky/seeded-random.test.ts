import { describe, expect, it, vi } from 'vitest';

import { seededRandom } from './seeded-random';

const draw = (random: () => number, count: number): number[] => Array.from({ length: count }, () => random());

describe('seededRandom', () => {
  it('produces an identical sequence from two independent generators sharing a seed', () => {
    const a = seededRandom(1_234_567);
    const b = seededRandom(1_234_567);

    expect(draw(a, 200)).toStrictEqual(draw(b, 200));
  });

  it('produces a different sequence for a different seed', () => {
    const a = seededRandom(1);
    const b = seededRandom(2);

    expect(draw(a, 10)).not.toStrictEqual(draw(b, 10));
  });

  it.each([
    ['a positive seed', 42],
    ['zero', 0],
    ['a negative seed', -99],
    ['a seed past the modulus', 3_000_000_000],
  ])('stays within [0, 1) over many draws from %s', (_label, seed) => {
    const random = seededRandom(seed);

    for (const value of draw(random, 500)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('never reads the clock, so hydration timing cannot change the sequence', () => {
    vi.useFakeTimers();

    const before = seededRandom(777);
    const beforeDraws = draw(before, 20);

    vi.advanceTimersByTime(60_000);

    const after = seededRandom(777);
    const afterDraws = draw(after, 20);

    expect(afterDraws).toStrictEqual(beforeDraws);

    vi.useRealTimers();
  });
});
