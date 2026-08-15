import type { ComponentPropsWithoutRef, FC, ReactNode } from 'react';

import './comet-link.css';

interface CometLinkBaseProps {
  children?: ReactNode;
}

interface CometLinkAnchorProps extends CometLinkBaseProps, Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'children'> {
  href: string;
}

interface CometLinkButtonProps extends CometLinkBaseProps, Omit<ComponentPropsWithoutRef<'button'>, 'children'> {
  href?: undefined;
}

type CometLinkProps = CometLinkAnchorProps | CometLinkButtonProps;

export const CometLink: FC<CometLinkProps> = props => {
  const { children, ...rest } = props;
  const inner = (
    <>
      <span style={{ position: 'relative', display: 'inline-block', paddingBottom: 5 }}>
        {children}
        <span className='ev-cml-u' aria-hidden='true' />
        <span className='ev-cml-d' aria-hidden='true'>
          <span
            style={{
              position: 'absolute',
              right: 0,
              top: 1,
              width: 26,
              height: 3,
              borderRadius: 3,
              background: 'linear-gradient(90deg, transparent, rgba(252,247,253,.95))',
              boxShadow: '0 0 8px 1px rgba(4,254,255,.8)',
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: -2,
              top: 0,
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: 'var(--star-white, #fcf7fd)',
              boxShadow: '0 0 10px 3px rgba(4,254,255,.9)',
            }}
          />
        </span>
        <span className='ev-cml-k' aria-hidden='true' />
      </span>
      <span className='ev-cml-a' aria-hidden='true'>
        →
      </span>
    </>
  );

  if (rest.href === undefined) {
    return (
      <button type='button' className='ev-cml' {...rest}>
        {inner}
      </button>
    );
  }

  return (
    <a className='ev-cml' {...rest}>
      {inner}
    </a>
  );
};
