import type { CSSProperties, FC } from 'react';

import { cn } from '#lib/cn';

import './shooting-star.css';
import { tw } from '#lib/tw';

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
    head: tw('size-[7px] shadow-(--glow-star)'),
    tail: tw('ml-[-3px] h-0.5 bg-[linear-gradient(90deg,#04feff,rgba(0,221,168,.6),transparent)]'),
    headFirst: true,
  },
  sweepRight: {
    animation: 'evShootR',
    head: tw('size-[7px] shadow-(--glow-star)'),
    tail: tw('mr-[-3px] h-0.5 bg-[linear-gradient(90deg,transparent,rgba(0,221,168,.55),#04feff)]'),
    headFirst: false,
  },
  steep: {
    animation: 'evShootB',
    head: tw('size-1.5 shadow-(--glow-comet-head)'),
    tail: tw('ml-[-3px] h-0.5 bg-[linear-gradient(90deg,#04feff,rgba(0,221,168,.55),transparent)]'),
    headFirst: true,
  },
  long: {
    animation: 'evShootD',
    head: tw('size-1.5 shadow-[0_0_9px_2px_rgba(159,232,255,.7)]'),
    tail: tw('ml-[-3px] h-[1.5px] bg-[linear-gradient(90deg,#9fe8ff,rgba(0,221,168,.4),transparent)]'),
    headFirst: true,
  },
};

interface ShootingStarBaseProps {
  tail?: number;
  duration?: number;
  delay?: number;
  /**
   * `loop` is the ambient sky, where an arc runs forever on its own timing.
   * `once` is a star put up in answer to something the reader did, which falls
   * a single time and is taken away again.
   */
  play?: 'loop' | 'once';
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
  const { tail = 160, duration = 12, delay = 4, play = 'loop', className, style } = props;
  const variant = props.arc === 'steep' || props.arc === 'long' ? VARIANT[props.arc] : props.direction === 'right' ? VARIANT.sweepRight : VARIANT.sweepLeft;

  const head = <span className={cn('flex-none rounded-[50%] bg-(--star-white)', variant.head)} />;
  const trail = <span className={cn('rounded-xs', variant.tail)} style={{ width: tail }} />;

  /* The star is inert here rather than at each call site, which is what the sky
     wrappers were already doing for the ones parented to them. `ScrollEndStar`
     is not: it is fixed over the page at z-5 for its three seconds, a third of
     a phone wide, and the tail won the hit test against the content under it. */
  return (
    <div
      aria-hidden='true'
      className={cn('pointer-events-none absolute', className)}
      style={{
        animation: `${variant.animation} ${duration}s linear ${delay}s ${play === 'once' ? 'both' : 'infinite backwards'}`,
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
