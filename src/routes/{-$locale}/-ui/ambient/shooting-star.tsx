import type { CSSProperties, FC } from 'react';

import { cn } from '../cn';

import './shooting-star.css';

type ShootingStarDirection = 'left' | 'right';

interface ShootingStarProps {
  direction?: ShootingStarDirection;
  tail?: number;
  duration?: number;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

const HEAD_CLASS = 'h-[7px] w-[7px] flex-none rounded-[50%] bg-[var(--star-white)] shadow-[var(--glow-star)]';

const TAIL_CLASS = {
  left: 'h-[2px] -ml-[3px] rounded-[2px] bg-[linear-gradient(90deg,#04feff,rgba(0,221,168,.6),transparent)]',
  right: 'h-[2px] -mr-[3px] rounded-[2px] bg-[linear-gradient(90deg,transparent,rgba(0,221,168,.55),#04feff)]',
};

export const ShootingStar: FC<ShootingStarProps> = ({ direction = 'left', tail = 160, duration = 12, delay = 4, className, style }) => {
  const head = <span className={HEAD_CLASS} />;
  const trail = <span className={TAIL_CLASS[direction]} style={{ width: tail }} />;

  return (
    <div
      aria-hidden='true'
      className={cn('absolute', className)}
      style={{
        animation: `${direction === 'left' ? 'evShootL' : 'evShootR'} ${duration}s linear ${delay}s infinite backwards`,
        ...style,
      }}
    >
      <span className='flex items-center'>
        {direction === 'left' ? (
          <>
            {head}
            {trail}
          </>
        ) : (
          <>
            {trail}
            {head}
          </>
        )}
      </span>
    </div>
  );
};
