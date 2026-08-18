import type { ComponentPropsWithoutRef, FC, ReactNode } from 'react';

import { cn } from '#lib/cn';
import { tw } from '#lib/tw';

type ButtonVariant = 'primary' | 'glass' | 'ghost';
type ButtonSize = 'md' | 'sm';

const BASE = tw(
  'inline-flex min-h-(--hit-target) cursor-pointer items-center gap-[10px] rounded-[999px] px-[26px] py-[13px] font-sans text-[1rem] font-bold no-underline active:transform-[scale(0.97)]',
);

const VARIANT = {
  primary: tw(
    'bg-(image:--grad-comet) text-(--ink-on-accent) shadow-(--glow-cta) transition-[transform,box-shadow] duration-150 ease-[ease] hover:transform-[translateY(-2px)] hover:shadow-(--glow-cta-hover)',
  ),
  glass: tw(
    'border border-(--line-white) bg-(--surface-glass) text-(--ink-title) backdrop-blur-[4px] transition-[border-color,background] duration-150 ease-[ease] hover:border-(--accent-cyan) hover:bg-[rgba(4,254,255,0.12)]',
  ),
  ghost: tw(
    'border border-(--line-accent) px-[18px] py-[8px] text-(length:--text-small) text-(--hue-cyan) transition-[background] duration-150 ease-[ease] hover:bg-[rgba(4,254,255,0.1)]',
  ),
} satisfies Record<ButtonVariant, string>;

const SIZE = {
  md: '',
  sm: tw('px-[18px] py-[8px] text-(length:--text-small)'),
} satisfies Record<ButtonSize, string>;

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
