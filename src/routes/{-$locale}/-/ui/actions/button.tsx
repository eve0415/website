import type { ComponentPropsWithoutRef, FC, ReactNode } from 'react';

import { cn } from '../../cn';

type ButtonVariant = 'primary' | 'glass' | 'ghost';
type ButtonSize = 'md' | 'sm';

const BASE =
  'inline-flex min-h-[44px] cursor-pointer items-center gap-[10px] rounded-[999px] px-[26px] py-[13px] font-sans text-[16px] font-bold no-underline active:transform-[scale(0.97)]';

const VARIANT = {
  primary:
    'bg-[image:var(--grad-comet)] text-[var(--ink-on-accent)] shadow-[var(--glow-cta)] transition-[transform,box-shadow] duration-150 ease-[ease] hover:transform-[translateY(-2px)] hover:shadow-[var(--glow-cta-hover)]',
  glass:
    'border border-[var(--line-white)] bg-[var(--surface-glass)] text-[var(--ink-title)] backdrop-blur-[4px] transition-[border-color,background] duration-150 ease-[ease] hover:border-[var(--accent-cyan)] hover:bg-[rgba(4,254,255,0.12)]',
  ghost:
    'border border-[var(--line-accent)] px-[18px] py-[8px] text-[14px] text-[var(--hue-cyan)] transition-[background] duration-150 ease-[ease] hover:bg-[rgba(4,254,255,0.1)]',
};

const SIZE = {
  md: '',
  sm: 'px-[18px] py-[8px] text-[14px]',
};

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
}

interface ButtonAnchorProps extends ButtonBaseProps, Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'children'> {
  href: string;
}

interface ButtonElementProps extends ButtonBaseProps, Omit<ComponentPropsWithoutRef<'button'>, 'children'> {
  href?: undefined;
}

type ButtonProps = ButtonAnchorProps | ButtonElementProps;

export const Button: FC<ButtonProps> = props => {
  const { variant = 'primary', size = 'md', className, children, ...rest } = props;
  const cls = cn(BASE, VARIANT[variant], SIZE[size], className);

  if (rest.href === undefined) {
    return (
      <button type='button' className={cls} {...rest}>
        {children}
      </button>
    );
  }

  return (
    <a className={cls} {...rest}>
      {children}
    </a>
  );
};
