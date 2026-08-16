import type { CSSProperties, ComponentPropsWithoutRef, FC, ReactNode, Ref } from 'react';

import { cn } from '../../cn';

const BASE =
  'inline-block rounded-[999px] border border-[var(--line-accent)] bg-[var(--surface-toast)] px-[22px] py-[12px] font-sans text-[length:var(--text-nav)] text-[#d8f9ff] shadow-[var(--glow-toast)]';

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
