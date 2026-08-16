import type { RunProps } from './run';
import type { FC } from 'react';

import { OVERLAY } from './run';

const WIPE_ANIMATION = {
  in: 'wipeIn .43s cubic-bezier(.7,.05,.3,1) both',
  out: 'wipeOut .47s cubic-bezier(.6,0,.3,1) both',
};

export const CometWipe: FC<RunProps> = ({ run, onSettled }) => (
  <div aria-hidden='true' className={OVERLAY}>
    <div className='absolute inset-[-60%]' style={{ transform: run.back ? 'rotate(12deg) scaleX(-1)' : 'rotate(-12deg)' }}>
      <div className='absolute inset-0' style={{ animation: WIPE_ANIMATION[run.phase] }} onAnimationEnd={onSettled}>
        <div className='absolute inset-0 bg-[linear-gradient(90deg,#05021c_0%,#0a0530_60%,#0d0836_100%)]' />
        <span className='absolute top-[32%] left-[22%] size-[3px] animate-[twinkle_1.4s_ease-in-out_infinite] rounded-full bg-(--star-white)' />
        <span className='absolute top-[55%] left-[48%] size-[2px] animate-[twinkle_1.1s_ease-in-out_.3s_infinite] rounded-full bg-(--star-ice)' />
        <span className='absolute top-[44%] left-[72%] size-[2px] animate-[twinkle_1.6s_ease-in-out_.6s_infinite] rounded-full bg-(--star-lilac)' />
        <div className='absolute inset-y-0 left-0 w-[48px] bg-[linear-gradient(90deg,rgba(4,254,255,.28),rgba(4,254,255,0))]' />
        <div className='absolute inset-y-0 left-[-2px] w-[3px] bg-[linear-gradient(180deg,rgba(4,254,255,0)_8%,#04feff_34%,#00dda8_66%,rgba(0,221,168,0)_92%)] shadow-[0_0_26px_7px_rgba(4,254,255,.45)]' />
        <span className='absolute top-[41%] left-[-7px] size-[13px] rounded-full bg-(--star-white) shadow-[0_0_22px_8px_rgba(4,254,255,.8)]' />
      </div>
    </div>
  </div>
);
