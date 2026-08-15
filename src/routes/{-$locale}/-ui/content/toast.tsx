import type { CSSProperties, ComponentPropsWithoutRef, FC, ReactNode } from 'react';

interface ToastProps extends Omit<ComponentPropsWithoutRef<'div'>, 'style' | 'children'> {
  style?: CSSProperties;
  children?: ReactNode;
}

export const Toast: FC<ToastProps> = ({ children, style, ...rest }) => (
  <div
    style={{
      display: 'inline-block',
      border: '1px solid var(--line-accent, rgba(4,254,255,.5))',
      background: 'var(--surface-toast, #0d0836)',
      color: '#d8f9ff',
      padding: '12px 22px',
      borderRadius: 999,
      fontSize: 'var(--text-nav, 14.5px)',
      fontFamily: "var(--font-sans, 'Noto Sans JP', sans-serif)",
      boxShadow: 'var(--glow-toast, 0 8px 32px rgba(4,254,255,.25))',
      ...style,
    }}
    {...rest}
  >
    {children}
  </div>
);
