import type { ComponentPropsWithoutRef, FC, ReactNode } from 'react';

import { cn } from '../cn';

const ROOT =
  'group relative isolate inline-flex min-h-[44px] cursor-pointer items-center overflow-hidden rounded-[999px] border border-[var(--line-white)] px-[28px] py-[13px] font-sans text-[15.5px] font-bold text-[var(--ink-title)] no-underline transition-[border-color] duration-300 ease-[ease] hover:border-[rgba(4,254,255,0.9)]';

const SWEEP =
  'pointer-events-none absolute inset-[-2px_-22px] transform-[translateX(-108%)_skewX(-16deg)] transition-[transform] duration-500 ease-[var(--ease-comet)] group-hover:transform-[translateX(0)_skewX(-16deg)]';

interface SweepButtonBaseProps {
  /** Rendered after the label; pass an empty string to drop it. */
  arrow?: string;
  children?: ReactNode;
}

interface SweepButtonAnchorProps extends SweepButtonBaseProps, Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'children'> {
  href: string;
}

interface SweepButtonElementProps extends SweepButtonBaseProps, Omit<ComponentPropsWithoutRef<'button'>, 'children'> {
  href?: undefined;
}

type SweepButtonProps = SweepButtonAnchorProps | SweepButtonElementProps;

export const SweepButton: FC<SweepButtonProps> = props => {
  const { arrow = '↗', className, children, ...rest } = props;
  const cls = cn(ROOT, className);
  const inner = (
    <>
      <span className={cn(SWEEP, 'bg-[rgba(159,232,255,0.95)]')} aria-hidden='true' />
      <span className={cn(SWEEP, 'bg-[image:var(--grad-comet)] delay-[0.08s]')} aria-hidden='true' />
      <span className='relative z-[1] inline-flex items-center gap-[10px] transition-[color] delay-[0.12s] duration-[0.25s] ease-[ease] group-hover:text-[var(--ink-on-accent)]'>
        {children}
        {arrow ? (
          <span
            className='inline-block transition-[transform] delay-[0.1s] duration-[0.3s] ease-[var(--ease-comet)] group-hover:transform-[translate(3px,-3px)]'
            aria-hidden='true'
          >
            {arrow}
          </span>
        ) : null}
      </span>
    </>
  );

  if (rest.href === undefined) {
    return (
      <button type='button' className={cls} {...rest}>
        {inner}
      </button>
    );
  }

  return (
    <a className={cls} {...rest}>
      {inner}
    </a>
  );
};
