import type { FC, RefObject } from 'react';

import { tw } from '#lib/tw';

/** Craters, as a fraction of the moon's own box. */
const CRATERS = [
  {
    key: 'a',
    left: '24%',
    top: '36%',
    size: '19%',
    tint: 'rgba(138,70,200,.3)',
    shadow: 'inset 2px 3px 6px rgba(58,29,122,.5), inset -1px -2px 4px rgba(255,247,255,.3)',
  },
  {
    key: 'b',
    left: '58%',
    top: '20%',
    size: '10%',
    tint: 'rgba(138,70,200,.28)',
    shadow: 'inset 1px 2px 4px rgba(58,29,122,.5), inset -1px -1px 3px rgba(255,247,255,.28)',
  },
  {
    key: 'c',
    left: '54%',
    top: '58%',
    size: '14%',
    tint: 'rgba(138,70,200,.26)',
    shadow: 'inset 2px 2px 5px rgba(58,29,122,.45), inset -1px -2px 3px rgba(255,247,255,.25)',
  },
] as const;

const ORBIT_DEPTH = tw('animate-[evOrbitDepth_9s_linear_infinite]');

interface MoonProps {
  /** The searchlight sweep; the page animates it imperatively when you search. */
  beamRef: RefObject<HTMLSpanElement | null>;
}

export const Moon: FC<MoonProps> = ({ beamRef }) => (
  <span aria-hidden='true' className='relative inline-block size-(--moon)'>
    <span
      ref={beamRef}
      aria-hidden='true'
      className='pointer-events-none absolute top-1/2 left-1/2 z-[-1] mt-[-120vmax] ml-[-120vmax] size-[240vmax] rounded-[50%] bg-[conic-gradient(from_0deg_at_50%_50%,rgba(4,254,255,.15)_0deg,rgba(4,254,255,.05)_22deg,transparent_30deg,transparent_360deg)] opacity-0'
    />
    <span className='absolute inset-[-13%] rounded-[50%] border border-dashed border-[rgba(159,232,255,.25)]' />
    <span className='absolute inset-[-13%] animate-[evOrbitSpin_9s_linear_infinite]'>
      <span
        aria-hidden='true'
        className={`absolute inset-0 rounded-[50%] bg-[conic-gradient(from_292deg_at_50%_50%,transparent_0deg,rgba(4,254,255,.08)_8deg,rgba(4,254,255,.45)_40deg,rgba(4,254,255,1)_68deg,transparent_68.5deg_360deg)] drop-shadow-[0_0_5px_rgba(4,254,255,.6)] [mask:radial-gradient(closest-side,transparent_93.5%,#000_95.5%,#000_100%)] ${ORBIT_DEPTH}`}
      />
      <span className={`absolute top-0 left-1/2 ${ORBIT_DEPTH}`}>
        <span className='absolute top-[-4px] left-[-4px] size-2 rounded-[50%] bg-(--star-white) shadow-(--glow-comet-head)' />
      </span>
    </span>
    <span className='relative z-1 block size-full animate-[evMoonIn_0.9s_var(--ev-spring)_0.3s_both,floaty_7s_ease-in-out_1.5s_infinite] rounded-[50%] bg-[radial-gradient(circle_at_33%_30%,#fff7ff,#eee0ff_34%,#cdb2ec_62%,#8a46c8_100%)] shadow-[0_0_44px_10px_rgba(238,224,255,.3),0_0_120px_34px_rgba(142,70,217,.28),inset_-14px_-18px_40px_rgba(58,29,122,.5)] transition-[filter] duration-300 ease-[ease] hover:filter-[brightness(1.12)]'>
      {CRATERS.map(crater => (
        <span
          key={crater.key}
          className='absolute rounded-[50%]'
          style={{ left: crater.left, top: crater.top, width: crater.size, height: crater.size, background: crater.tint, boxShadow: crater.shadow }}
        />
      ))}
    </span>
  </span>
);
