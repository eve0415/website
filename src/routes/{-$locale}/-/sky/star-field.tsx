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
   * Not redundant with React Compiler, which is the usual reason to delete a
   * `useMemo` here — this component is one the compiler cannot compile at all.
   * `babel-plugin-react-compiler@1.0.0` fails HIR lowering on any destructuring
   * default (`{ count = 40 }`, parameter or `const`, with or without types)
   * with a `Todo`-category error, and `panicThreshold: 'critical_errors'` makes
   * that a silent skip. So this is the only memoization the star field has, and
   * without it every layout render rebuilds all 36–62 star objects.
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
