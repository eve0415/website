import type { Phase, RunProps } from './run';
import type { FC } from 'react';

import { OVERLAY } from './run';

/**
 * The right half closes last and the left half opens last, so the element that
 * reports the phase settled changes with the phase — see `onSettled` in
 * `index.tsx`, which is not safe to call twice for one phase.
 */
const DOOR_ANIMATION = {
  left: { in: 'doorInL .44s var(--ease-comet) both', out: 'doorOutL .52s cubic-bezier(.6,0,.3,1) .06s both' },
  right: { in: 'doorInR .44s var(--ease-comet) .05s both', out: 'doorOutR .52s cubic-bezier(.6,0,.3,1) both' },
} satisfies Record<'left' | 'right', Record<Phase, string>>;

const SETTLES = { in: 'right', out: 'left' } satisfies Record<Phase, 'left' | 'right'>;

export const DoorWipe: FC<RunProps> = ({ run, onSettled }) => {
  const settles = SETTLES[run.phase];

  return (
    <div aria-hidden='true' className={OVERLAY}>
      <div
        className='absolute inset-y-0 right-1/2 left-0 bg-[linear-gradient(90deg,#05021c,#0a0530)]'
        style={{ animation: DOOR_ANIMATION.left[run.phase] }}
        onAnimationEnd={settles === 'left' ? onSettled : undefined}
      >
        <span className='absolute top-[28%] left-[30%] size-[3px] animate-[twinkle_1.3s_ease-in-out_infinite] rounded-full bg-(--star-white)' />
        <span className='absolute top-[64%] left-[62%] size-0.5 animate-[twinkle_1.7s_ease-in-out_.4s_infinite] rounded-full bg-(--star-ice)' />
        <div className='absolute inset-y-0 right-0 w-11.5 bg-[linear-gradient(270deg,rgba(4,254,255,.26),rgba(4,254,255,0))]' />
        <div className='absolute inset-y-0 -right-px w-[3px] bg-[linear-gradient(180deg,rgba(4,254,255,0)_6%,#04feff_34%,#00dda8_66%,rgba(0,221,168,0)_94%)] shadow-[0_0_24px_6px_rgba(4,254,255,.5)]' />
      </div>

      <div
        className='absolute inset-y-0 right-0 left-1/2 bg-[linear-gradient(270deg,#05021c,#0a0530)]'
        style={{ animation: DOOR_ANIMATION.right[run.phase] }}
        onAnimationEnd={settles === 'right' ? onSettled : undefined}
      >
        <span className='absolute top-[38%] left-[40%] size-0.5 animate-[twinkle_1.5s_ease-in-out_.2s_infinite] rounded-full bg-(--star-lilac)' />
        <span className='absolute top-[70%] left-[72%] size-[3px] animate-[twinkle_1.2s_ease-in-out_.6s_infinite] rounded-full bg-(--star-white)' />
        <div className='absolute inset-y-0 left-0 w-11.5 bg-[linear-gradient(90deg,rgba(4,254,255,.26),rgba(4,254,255,0))]' />
        <div className='absolute inset-y-0 -left-px w-[3px] bg-[linear-gradient(180deg,rgba(0,221,168,0)_6%,#00dda8_34%,#04feff_66%,rgba(4,254,255,0)_94%)] shadow-[0_0_24px_6px_rgba(4,254,255,.5)]' />
      </div>

      {/* The seam sparkle marks the moment the halves meet, so it plays on the
          way in and has nothing to say on the way out. The comp delays it .34s
          against a hold it times itself; here the halves meet at .49s and the
          page is released the instant they do, so the delay is the one that
          puts the peak on the seam rather than the one the comp writes. */}
      {run.phase === 'in' ? (
        <span className='absolute top-1/2 left-1/2 mt-[-9px] ml-[-9px] size-4.5 transform-[scale(0)] animate-[doorKira_.5s_ease-in-out_.24s_both] bg-(--star-white) drop-shadow-[0_0_8px_rgba(4,254,255,.95)] [clip-path:polygon(50%_0%,61%_39%,100%_50%,61%_61%,50%_100%,39%_61%,0%_50%,39%_39%)]' />
      ) : null}
    </div>
  );
};
