import type { CSSProperties, ComponentPropsWithoutRef, FC, ReactNode, Ref } from 'react';

import { tw } from '#routes/-/tw';

import { cn } from '../../cn';

const BASE = tw(
  'inline-block rounded-[999px] border border-(--line-accent) bg-(--surface-toast) px-[22px] py-[12px] font-sans text-(length:--text-nav) text-[#d8f9ff] shadow-(--glow-toast)',
);

interface ToastProps extends Omit<ComponentPropsWithoutRef<'div'>, 'style' | 'children'> {
  style?: CSSProperties;
  children?: ReactNode;
  /** Needed by a caller that shows this as a popover, which is imperative. */
  ref?: Ref<HTMLDivElement>;
}

export const Toast: FC<ToastProps> = ({ className, children, style, ref, ...rest }) => (
  <div ref={ref} className={cn(BASE, className)} style={style} {...rest}>
    {children}
  </div>
);
