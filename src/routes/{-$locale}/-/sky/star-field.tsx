import type { CSSProperties, FC } from 'react';

import { useMemo } from 'react';

import { cn } from '#lib/cn';

import './star-field.css';
import { seededRandom } from './seeded-random';

const COLORS = ['#fcf7fd', '#fcf7fd', '#fcf7fd', '#9fe8ff', '#9fe8ff', '#c9a6ff', '#ffd9ec'] as const satisfies string[];

/** Any constant works — it only has to be the same one on the server and in the browser. */
const DEFAULT_SEED = 20_150_415;

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
  className?: string;
  style?: CSSProperties;
}

export const StarField: FC<StarFieldProps> = ({ count = 40, topMax = 100, seed = DEFAULT_SEED, className, style }) => {
  /**
   * Not redundant with React Compiler, because the compiler silently skips this
   * component. The cause is the *pairing*, not the plugin: driven by
   * `@babel/core@8`, `babel-plugin-react-compiler@1.0.0` raises a
   * `Todo`-category error on any destructuring default (`{ count = 40 }`,
   * parameter or in-body `const`), and `panicThreshold: 'critical_errors'`
   * turns that into a skip with no warning. Verified by running the pinned
   * preset over both shapes: `{ n = 4 }` skips, `{ n }` compiles.
   *
   * So this is the only memoization the star field has, and without it every
   * layout render rebuilds all 10–62 star objects. Seven other components hit
   * the same skip without compensating for it.
   *
   * Delete this `useMemo` once the Babel pin moves and the shape compiles.
   */
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
    <div aria-hidden='true' className={cn('pointer-events-none absolute inset-0', className)} style={style}>
      {stars.map(star => (
        <span
          key={star.key}
          className='absolute rounded-[50%]'
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            background: star.color,
            animation: `evTwinkle ${star.duration} ease-in-out ${star.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
};
