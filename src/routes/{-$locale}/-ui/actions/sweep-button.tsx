import type { ComponentPropsWithoutRef, FC, ReactNode } from 'react';

import './sweep-button.css';

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
  const { arrow = '↗', children, ...rest } = props;
  const inner = (
    <>
      <span className='ev-swp-1' aria-hidden='true' />
      <span className='ev-swp-2' aria-hidden='true' />
      <span className='ev-swp-t'>
        {children}
        {arrow ? (
          <span className='ev-swp-a' aria-hidden='true'>
            {arrow}
          </span>
        ) : null}
      </span>
    </>
  );

  if (rest.href === undefined) {
    return (
      <button type='button' className='ev-swp' {...rest}>
        {inner}
      </button>
    );
  }

  return (
    <a className='ev-swp' {...rest}>
      {inner}
    </a>
  );
};
