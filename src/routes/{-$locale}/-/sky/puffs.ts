import { seededRandom } from './seeded-random';

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
 * zoom taken back out, over 1500.
 *
 * `Math.max(1, …)` is where the design stops, so the authored size holds all the
 * way down from 1500 to a phone. At 375px that leaves the widest puff 378px
 * wide, wider than the screen: the sea stops being a band under the copy and
 * becomes a pale mass behind it, which is what `SHRINK_FROM` answers.
 *
 * Two thresholds rather than one, because widening and shrinking are not the
 * same question. Dropping the floor alone would shrink every viewport under
 * 1500 — a 1024px laptop loses a third of its puff, and nothing was wrong
 * there. So `min()` holds the authored size down to `SHRINK_FROM` and only the
 * band below it scales, which leaves every laptop width exactly as the design
 * draws it.
 *
 * `MIN_K` is where the shrinking stops, and it is not the proportional value:
 * the sea has to stay a sea. Scaled strictly with the viewport a puff lands
 * near 90px while the layer still spreads its count across 114% of the width,
 * so the puffs stop overlapping and the sea reads as exactly the field of
 * separate blobs `k` exists to prevent. Comparing 0.3, 0.45 and 0.6 at 375px,
 * 0.6 is the first that still merges them.
 */
const MIN_K = 0.6;
const SHRINK_FROM = 900;

/** `px` as the design draws it from `SHRINK_FROM` up to 1500, tracking the viewport past either end. */
export const fluid = (px: number): string =>
  `clamp(${(px * MIN_K).toFixed(0)}px, max(${(px / 1500).toFixed(4)} * 100vw / var(--z, 1), min(${px.toFixed(0)}px, ${(px / SHRINK_FROM).toFixed(4)} * 100vw / var(--z, 1))), ${(px * 1.7).toFixed(0)}px)`;

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
      width: fluid(w),
      height: fluid(w * (0.4 + random() * 0.18)),
    });
  }
  return generated;
};
