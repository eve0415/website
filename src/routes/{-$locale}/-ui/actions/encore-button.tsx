import type { ComponentPropsWithoutRef, FC, ReactNode } from 'react';

import { cn } from '../cn';

import './encore-button.css';

const ROOT =
  'group relative isolate inline-flex min-h-[44px] cursor-pointer items-center overflow-hidden rounded-[999px] border border-[var(--line-header)] px-[22px] py-[9px] font-sans text-[14px] text-[var(--ink-faint)] no-underline transition-[border-color] duration-300 ease-[ease] hover:border-[rgba(4,254,255,0.75)]';

const WIPE = 'absolute top-[-2px] bottom-[-2px] w-[54%] transition-[transform] duration-[0.45s] ease-[var(--ease-comet)] group-hover:transform-[translateX(0)]';

interface EncoreButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'children'> {
  dot?: boolean;
  children?: ReactNode;
}

export const EncoreButton: FC<EncoreButtonProps> = ({ dot = true, className, children, ...rest }) => (
  <button type='button' className={cn(ROOT, className)} {...rest}>
    <span className={cn(WIPE, 'left-[-2px] transform-[translateX(-103%)] bg-[linear-gradient(90deg,#04feff,#02ebcf)]')} aria-hidden='true' />
    <span className={cn(WIPE, 'right-[-2px] transform-[translateX(103%)] bg-[linear-gradient(90deg,#02ebcf,#00dda8)]')} aria-hidden='true' />
    <span className='relative z-1 inline-flex items-center gap-[9px] transition-[color] delay-[0.12s] duration-[0.22s] ease-[ease] group-hover:text-(--ink-on-accent)'>
      {dot ? <span className='size-[6px] animate-[evGlowPulse_2.8s_ease-in-out_infinite_alternate] rounded-[50%] bg-current' aria-hidden='true' /> : null}
      {children}
    </span>
  </button>
);
