import type { ComponentPropsWithoutRef, FC, ReactNode } from 'react';

import './encore-button.css';

interface EncoreButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'children'> {
  dot?: boolean;
  children?: ReactNode;
}

export const EncoreButton: FC<EncoreButtonProps> = ({ dot = true, children, ...rest }) => (
  <button type='button' className='ev-enc' {...rest}>
    <span className='ev-enc-l' aria-hidden='true' />
    <span className='ev-enc-r' aria-hidden='true' />
    <span className='ev-enc-t'>
      {dot ? <span className='ev-enc-dot' aria-hidden='true' /> : null}
      {children}
    </span>
  </button>
);
