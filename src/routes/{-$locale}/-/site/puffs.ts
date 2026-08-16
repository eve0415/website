import { seededRandom } from '../ui/ambient/star-field';

export interface Puff {
  key: string;
  left: string;
  bottom: string;
  width: string;
  height: string;
}

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
      width: `${w.toFixed(0)}px`,
      height: `${(w * (0.4 + random() * 0.18)).toFixed(0)}px`,
    });
  }
  return generated;
};
