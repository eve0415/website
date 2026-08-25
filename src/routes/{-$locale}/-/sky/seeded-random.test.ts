import { describe, expect, it, vi } from 'vitest';

import { seededRandom } from './seeded-random';

const draw = (random: () => number, count: number): number[] => Array.from({ length: count }, () => random());

describe('seededRandom', () => {
  /**
   * Determinism alone does not pin the sequence: any mutation that stays
   * deterministic, seed-dependent and inside [0, 1) — a different multiplier, a
   * different modulus, the output rescaled — passes every other test here while
   * moving every prerendered star and puff. These five come from the Lehmer
   * recurrence itself: `state = 1 * 16807 mod M`, then `(state - 1) / (M - 1)`,
   * and so on. `toStrictEqual` is exact because the largest intermediate product
   * is 2.7e13, well inside the exactly-representable integers.
   *
   * The first two terms never reach the `% MODULUS`, since 16807 squared is under
   * the modulus — term 1 pins the `(MODULUS - 1)` divisor, term 3 is the first
   * wrap and pins the modulus.
   */
  it('draws the Lehmer sequence itself, so no prerendered position moves', () => {
    expect(draw(seededRandom(1), 5)).toStrictEqual([7.825903601782307e-6, 0.13153778773875702, 0.7556053220812281, 0.4586501316713636, 0.5327672371945971]);
  });

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
