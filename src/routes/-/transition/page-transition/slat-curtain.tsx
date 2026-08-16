import type { RunProps } from './run';
import type { FC } from 'react';

import { OVERLAY } from './run';

const SLAT_KEYFRAMES = {
  up: { in: 'slatUpIn', out: 'slatUpOut' },
  down: { in: 'slatDownIn', out: 'slatDownOut' },
};

const SLAT_ORDER = [0, 1, 2, 3, 4];
const LAST_SLAT = SLAT_ORDER.length - 1;

export const SlatCurtain: FC<RunProps> = ({ run, onSettled }) => {
  const keyframes = SLAT_KEYFRAMES[run.up ? 'up' : 'down'][run.phase];
  const edge = { background: run.hue.edge, boxShadow: run.hue.shadow };

  return (
    <div aria-hidden='true' className={`${OVERLAY} flex`}>
      {SLAT_ORDER.map(index => {
        // Left to right as they rise, right to left as they fall — the stagger
        // always runs away from the page you came from.
        const order = run.up ? index : LAST_SLAT - index;

        return (
          <div
            key={index}
            className='relative -mx-px flex-1'
            style={{
              background: `linear-gradient(${run.up ? '180deg' : '0deg'}, ${run.hue.top} 0%, #0a0530 36%, #05021c 100%)`,
              animation: `${keyframes} .4s var(--ease-comet) ${(order * 0.05).toFixed(2)}s both`,
            }}
            onAnimationEnd={order === LAST_SLAT ? onSettled : undefined}
          >
            <span className='absolute inset-x-0 h-[3px]' style={run.up ? { top: 0, ...edge } : { bottom: 0, ...edge }} />
          </div>
        );
      })}
    </div>
  );
};
