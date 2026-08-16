import type { CSSProperties, FC, ReactNode } from 'react';

import { cn } from '../../../cn';
import { StarField } from '../star-field';

import { skyCss } from './palette';

interface SkyBackgroundProps {
  timeOfDay?: number;
  stars?: number;
  minHeight?: number | string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export const SkyBackground: FC<SkyBackgroundProps> = ({ timeOfDay = 0, stars = 60, minHeight = 200, className, style, children }) => {
  const sky = skyCss(timeOfDay);
  return (
    <div className={cn('relative overflow-hidden font-sans', className)} style={{ background: sky.rootBg, minHeight, ...style }}>
      <div aria-hidden='true' className='pointer-events-none absolute inset-0' style={{ background: sky.nebulaBg }} />
      {stars > 0 ? <StarField count={stars} style={{ opacity: sky.starAlpha }} /> : null}
      <div className='relative'>{children}</div>
    </div>
  );
};
