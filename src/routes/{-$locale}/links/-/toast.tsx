import type { CSSProperties, ComponentPropsWithoutRef, FC, ReactNode, Ref } from 'react';

import { cn } from '#lib/cn';
import { tw } from '#lib/tw';

const BASE = tw(
  'inline-block rounded-[999px] border border-(--line-accent) bg-(--surface-toast) px-5.5 py-3 font-sans text-(length:--text-nav) text-[#d8f9ff] shadow-(--glow-toast)',
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
