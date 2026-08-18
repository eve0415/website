import { seededRandom } from './star-field';

export interface Puff {
  key: string;
  left: string;
  bottom: string;
  width: string;
  height: string;
}

/**
 * The design widens every puff on a large viewport — `k` in its own source — so
 * the cloud sea keeps its proportions instead of breaking into small blobs. It
 * derives that from `window.innerWidth`, which cannot survive the prerender, so
 * the same curve is expressed in CSS: the viewport width with the ultra-wide
 * zoom taken back out, over 1500, clamped to 1–1.7. Below 1500px it resolves to
 * exactly the authored size.
 */
const scaled = (px: number): string => `clamp(${px.toFixed(0)}px, ${(px / 1500).toFixed(4)} * 100vw / var(--z, 1), ${(px * 1.7).toFixed(0)}px)`;

/**
 * One drifting layer of the cloud sea: `count` ellipses spread evenly across a
 * band wider than the viewport, each jittered within it.
 *
 * The design scatters these with `Math.random()`, which renders a different sky
 * on the server than in the browser and cannot survive hydration — the seed is
 * what makes the two agree. Arguments mirror the design's own signature: the
 * vertical band (`bottom0`–`bottom1`, px) and the width range (`w0`–`w1`, px);
 * height is 40–58% of width, as authored.
 */
export const puffs = (seed: number, count: number, bottom0: number, bottom1: number, w0: number, w1: number): readonly Puff[] => {
  const random = seededRandom(seed);
  const generated: Puff[] = [];
  for (let i = 0; i < count; i++) {
    const w = w0 + random() * (w1 - w0);
    generated.push({
      key: `puff-${i}`,
      left: `${(-8 + ((i + random() * 0.9) / count) * 114).toFixed(1)}%`,
      bottom: `${(bottom0 + random() * (bottom1 - bottom0)).toFixed(0)}px`,
      width: scaled(w),
      height: scaled(w * (0.4 + random() * 0.18)),
    });
  }
  return generated;
};
