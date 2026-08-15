import type { ComponentPropsWithoutRef, FC, ReactNode } from 'react';

import './link-row.css';

interface LinkRowBaseProps {
  label?: string;
  value?: string;
}

interface LinkRowAnchorProps extends LinkRowBaseProps, Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'children'> {
  href: string;
  /** Anchor rows render as a single link, so there is nothing to slot an action into. */
  action?: undefined;
}

interface LinkRowDivProps extends LinkRowBaseProps, Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  href?: undefined;
  action?: ReactNode;
}

type LinkRowProps = LinkRowAnchorProps | LinkRowDivProps;

export const LinkRow: FC<LinkRowProps> = props => {
  const { label, value, action, ...rest } = props;

  if (rest.href === undefined) {
    return (
      <div className='ev-lrow ev-lrow--action' {...rest}>
        <strong>{label}</strong>
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {value ? <span className='ev-lrow-v'>{value}</span> : null}
          {action}
        </span>
      </div>
    );
  }

  return (
    <a className='ev-lrow' {...rest}>
      <strong>{label}</strong>
      {value ? <span className='ev-lrow-v'>{value}</span> : null}
    </a>
  );
};
