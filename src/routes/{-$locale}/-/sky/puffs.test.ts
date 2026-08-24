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

const parsePx = (css: string): number => {
  const match = /^(-?\d+)px$/.exec(css);
  if (!match) throw new Error(`not a plain px value: ${css}`);

  const [, value] = match;
  if (value === undefined) throw new Error(`px value is missing its number: ${css}`);

  return Number(value);
};

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

  it('gives every puff a unique key', () => {
    const generated = puffs(11, 25, 0, 50, 50, 100);

    expect(new Set(generated.map(puff => puff.key)).size).toBe(generated.length);
  });
});
