import type { CSSProperties, FC } from 'react';

import { useMemo } from 'react';

import './star-field.css';

const COLORS: readonly [string, ...string[]] = ['#fcf7fd', '#fcf7fd', '#fcf7fd', '#9fe8ff', '#9fe8ff', '#c9a6ff', '#ffd9ec'];

/** Any constant works — it only has to be the same one on the server and in the browser. */
const DEFAULT_SEED = 20_150_415;

const MODULUS = 2_147_483_647;

/**
 * The original scattered stars with `Math.random()`, which renders a different
 * field on the server than on the client and so cannot survive hydration. This
 * is a Lehmer generator (MINSTD): pure, seedable, and — unlike mulberry32 —
 * free of the bitwise operators this repo's lint config rejects. `state *
 * 16807` peaks around 3.6e13, well inside the exactly-representable integer
 * range, so server and client agree bit for bit.
 */
const seededRandom = (seed: number) => {
  let state = Math.trunc(seed) % MODULUS;
  if (state <= 0) state += MODULUS - 1;
  return () => {
    state = (state * 16_807) % MODULUS;
    return (state - 1) / (MODULUS - 1);
  };
};

interface Star {
  key: string;
  top: string;
  left: string;
  size: string;
  color: string;
  delay: string;
  duration: string;
}

interface StarFieldProps {
  count?: number;
  topMax?: number;
  seed?: number;
  style?: CSSProperties;
}

export const StarField: FC<StarFieldProps> = ({ count = 40, topMax = 100, seed = DEFAULT_SEED, style }) => {
  const stars = useMemo(() => {
    const random = seededRandom(seed);
    const generated: Star[] = [];
    for (let i = 0; i < count; i++) {
      generated.push({
        key: `star-${i}`,
        top: `${(random() * topMax).toFixed(2)}%`,
        left: `${(random() * 100).toFixed(2)}%`,
        size: `${(1.4 + random() * 1.9).toFixed(1)}px`,
        color: COLORS[Math.floor(random() * COLORS.length)] ?? COLORS[0],
        delay: `${(random() * 5).toFixed(2)}s`,
        duration: `${(2.4 + random() * 3).toFixed(2)}s`,
      });
    }
    return generated;
  }, [count, topMax, seed]);

  return (
    <div aria-hidden='true' style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...style }}>
      {stars.map(star => (
        <span
          key={star.key}
          style={{
            position: 'absolute',
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            borderRadius: '50%',
            background: star.color,
            animation: `evTwinkle ${star.duration} ease-in-out ${star.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
};
