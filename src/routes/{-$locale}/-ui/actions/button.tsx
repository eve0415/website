import type { ComponentPropsWithoutRef, FC, ReactNode } from 'react';

import './button.css';

type ButtonVariant = 'primary' | 'glass' | 'ghost';
type ButtonSize = 'md' | 'sm';

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
  const { variant = 'primary', size = 'md', children, ...rest } = props;
  const cls = `ev-btn ev-btn--${variant}${size === 'sm' ? ' ev-btn--sm' : ''}`;

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
