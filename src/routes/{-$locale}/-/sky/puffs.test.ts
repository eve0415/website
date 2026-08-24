import { describe, expect, it } from 'vitest';

import { fluid, puffs } from './puffs';

interface ParsedFluid {
  low: number;
  viewportLow: number;
  mid: number;
  viewportHigh: number;
  high: number;
}

const FLUID_PATTERN = /^clamp\((\d+)px, max\(([\d.]+) \* 100vw \/ var\(--z, 1\), min\((\d+)px, ([\d.]+) \* 100vw \/ var\(--z, 1\)\)\), (\d+)px\)$/;

/** Reads the five numbers a `fluid()` string encodes, or throws if a clamp term is missing. */
const parseFluid = (css: string): ParsedFluid => {
  const match = FLUID_PATTERN.exec(css);
  if (!match) throw new Error(`not a well-formed fluid() clamp: ${css}`);

  const [, low, viewportLow, mid, viewportHigh, high] = match;
  if (low === undefined || viewportLow === undefined || mid === undefined || viewportHigh === undefined || high === undefined) {
    throw new Error(`fluid() clamp is missing a captured term: ${css}`);
  }

  return { low: Number(low), viewportLow: Number(viewportLow), mid: Number(mid), viewportHigh: Number(viewportHigh), high: Number(high) };
};

const parsePercent = (css: string): number => {
  const match = /^(-?\d+\.\d)%$/.exec(css);
  if (!match) throw new Error(`not a one-decimal percentage: ${css}`);

  const [, value] = match;
  if (value === undefined) throw new Error(`percentage is missing its number: ${css}`);

  return Number(value);
};

const parsePx = (css: string): number => {
  const match = /^(-?\d+)px$/.exec(css);
  if (!match) throw new Error(`not a plain px value: ${css}`);

  const [, value] = match;
  if (value === undefined) throw new Error(`px value is missing its number: ${css}`);

  return Number(value);
};

type PuffField = readonly [label: string, seed: number, count: number, bottom0: number, bottom1: number, w0: number, w1: number];

/**
 * Every field the app prerenders: `-/home/hero.tsx`'s four cloud layers and
 * `-/not-found/scene.ts`'s three. Change a call there and change this with it —
 * the ratio bounds below are sized against these widths.
 */
const PRERENDERED = [
  ['the hero back layer', 1_010_415, 9, -25, 40, 220, 380],
  ['the hero mid layer', 2_020_415, 11, -45, 5, 170, 300],
  ['the hero front layer', 3_030_415, 12, -95, -15, 150, 270],
  ['the hero low layer', 4_040_415, 11, -175, -55, 220, 360],
  ['the 404 back layer', 5_050_404, 10, 26, 110, 200, 340],
  ['the 404 mid layer', 6_060_404, 12, -10, 70, 170, 300],
  ['the 404 front layer', 7_070_404, 12, -60, 22, 150, 280],
] as const satisfies PuffField[];

describe('fluid', () => {
  it.each([60, 90, 150, 200, 280, 340, 378])('clamps %ipx between 0.6x and 1.7x, tracking the viewport in between', px => {
    const parsed = parseFluid(fluid(px));

    expect(parsed.low).toBe(Math.round(px * 0.6));
    expect(parsed.high).toBe(Math.round(px * 1.7));
    expect(parsed.mid).toBe(Math.round(px));
    expect(parsed.viewportLow).toBeCloseTo(px / 1500, 4);
    expect(parsed.viewportHigh).toBeCloseTo(px / 900, 4);
    expect(parsed.viewportLow).toBeLessThan(parsed.viewportHigh);
  });
});

describe('puffs', () => {
  it('returns exactly `count` puffs', () => {
    expect(puffs(1, 7, 0, 100, 100, 200)).toHaveLength(7);
    expect(puffs(1, 0, 0, 100, 100, 200)).toHaveLength(0);
  });

  it('produces deep-equal output for identical arguments, so hydration sees the same markup twice', () => {
    const first = puffs(5_050_404, 10, 26, 110, 200, 340);
    const second = puffs(5_050_404, 10, 26, 110, 200, 340);

    expect(second).toStrictEqual(first);
  });

  it('keeps every bottom within the supplied band', () => {
    const generated = puffs(6_060_404, 40, -10, 70, 170, 300);

    for (const puff of generated) {
      const bottom = parsePx(puff.bottom);
      expect(bottom).toBeGreaterThanOrEqual(-10);
      expect(bottom).toBeLessThanOrEqual(70);
    }
  });

  it('keeps every width within the supplied band', () => {
    const generated = puffs(7_070_404, 40, -60, 22, 150, 280);

    for (const puff of generated) {
      const width = parseFluid(puff.width).mid;
      expect(width).toBeGreaterThanOrEqual(150);
      expect(width).toBeLessThanOrEqual(280);
    }
  });

  it('never emits NaN, undefined, or Infinity in a generated field', () => {
    const generated = puffs(9_090_909, 30, -60, 110, 90, 340);

    for (const puff of generated) {
      for (const value of [puff.left, puff.bottom, puff.width, puff.height]) {
        expect(value).not.toContain('NaN');
        expect(value).not.toContain('undefined');
        expect(value).not.toContain('Infinity');
      }
    }
  });

  /**
   * Monotonicity is a property of the formula, not of the draws: adjacent `left`
   * values differ by `((1 + 0.9 * (next - current)) / count) * 114`, so the step is
   * at least `11.4 / count` however the seed falls — 0.95% at the widest count here,
   * far past what `toFixed(1)` can move. The band is the same: `i = 0, random >= 0`
   * puts the first puff at `-8` exactly, and the last below
   * `-8 + 114 * (1 - 0.1 / count)`, which is under 106 for any count.
   *
   * That one pair is what pins the `i` term, the `/ count`, the `114` and the `-8`
   * together, with no golden values to rewrite when a seed changes.
   */
  it.each(PRERENDERED)('spreads %s left to right across the band without stacking or overflowing', (_label, seed, count, bottom0, bottom1, w0, w1) => {
    const generated = puffs(seed, count, bottom0, bottom1, w0, w1);

    let previous = Number.NEGATIVE_INFINITY;
    for (const puff of generated) {
      const left = parsePercent(puff.left);

      expect(left).toBeGreaterThan(previous);
      expect(left).toBeGreaterThanOrEqual(-8);
      expect(left).toBeLessThan(106);

      previous = left;
    }
  });

  /**
   * Height is 40–58% of width as authored, but both sides pass through `toFixed(0)`
   * first, so each moves by up to half a pixel and the ratio carries `±0.5 / w` of
   * slack. Every field above starts at `w0 >= 150`, which keeps the true range inside
   * these bounds; a narrower field would need wider ones.
   */
  it.each(PRERENDERED)('keeps every %s puff between two fifths and three fifths as tall as it is wide', (_label, seed, count, bottom0, bottom1, w0, w1) => {
    const generated = puffs(seed, count, bottom0, bottom1, w0, w1);

    for (const puff of generated) {
      const ratio = parseFluid(puff.height).mid / parseFluid(puff.width).mid;

      expect(ratio).toBeGreaterThan(0.39);
      expect(ratio).toBeLessThan(0.59);
    }
  });

  it('gives every puff a unique key', () => {
    const generated = puffs(11, 25, 0, 50, 50, 100);

    expect(new Set(generated.map(puff => puff.key)).size).toBe(generated.length);
  });
});
