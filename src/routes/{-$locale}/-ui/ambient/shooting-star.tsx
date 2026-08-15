import type { CSSProperties, FC } from 'react';

import { cn } from '../cn';

import './shooting-star.css';

type ShootingStarDirection = 'left' | 'right';

/**
 * The arcs the design authors. `sweep` is the bright one that crosses the whole
 * viewport either way; `steep` falls harder and dimmer; `long` is the faint ice
 * one that travels furthest. Only `sweep` is drawn in both directions.
 */
type ShootingStarArc = 'sweep' | 'steep' | 'long';

const VARIANT = {
  sweepLeft: {
    animation: 'evShootL',
    head: 'size-[7px] shadow-[var(--glow-star)]',
    tail: 'h-[2px] -ml-[3px] bg-[linear-gradient(90deg,#04feff,rgba(0,221,168,.6),transparent)]',
    headFirst: true,
  },
  sweepRight: {
    animation: 'evShootR',
    head: 'size-[7px] shadow-[var(--glow-star)]',
    tail: 'h-[2px] -mr-[3px] bg-[linear-gradient(90deg,transparent,rgba(0,221,168,.55),#04feff)]',
    headFirst: false,
  },
  steep: {
    animation: 'evShootB',
    head: 'size-[6px] shadow-[var(--glow-comet-head)]',
    tail: 'h-[2px] -ml-[3px] bg-[linear-gradient(90deg,#04feff,rgba(0,221,168,.55),transparent)]',
    headFirst: true,
  },
  long: {
    animation: 'evShootD',
    head: 'size-[6px] shadow-[0_0_9px_2px_rgba(159,232,255,.7)]',
    tail: 'h-[1.5px] -ml-[3px] bg-[linear-gradient(90deg,#9fe8ff,rgba(0,221,168,.4),transparent)]',
    headFirst: true,
  },
};

interface ShootingStarBaseProps {
  tail?: number;
  duration?: number;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

interface ShootingStarSweepProps extends ShootingStarBaseProps {
  arc?: 'sweep';
  direction?: ShootingStarDirection;
}

interface ShootingStarFallProps extends ShootingStarBaseProps {
  arc: Exclude<ShootingStarArc, 'sweep'>;
  /** The falling arcs are authored travelling left only, so there is nothing to flip. */
  direction?: undefined;
}

type ShootingStarProps = ShootingStarSweepProps | ShootingStarFallProps;

export const ShootingStar: FC<ShootingStarProps> = props => {
  const { tail = 160, duration = 12, delay = 4, className, style } = props;
  const variant = props.arc === 'steep' || props.arc === 'long' ? VARIANT[props.arc] : props.direction === 'right' ? VARIANT.sweepRight : VARIANT.sweepLeft;

  const head = <span className={cn('flex-none rounded-[50%] bg-(--star-white)', variant.head)} />;
  const trail = <span className={cn('rounded-[2px]', variant.tail)} style={{ width: tail }} />;

  return (
    <div
      aria-hidden='true'
      className={cn('absolute', className)}
      style={{
        animation: `${variant.animation} ${duration}s linear ${delay}s infinite backwards`,
        ...style,
      }}
    >
      <span className='flex items-center'>
        {variant.headFirst ? (
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
