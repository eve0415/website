import type { ComponentPropsWithoutRef, FC, ReactNode } from 'react';

import { cn } from '#lib/cn';
import { tw } from '#lib/tw';

const BASE = tw(
  'flex items-center justify-between gap-3 rounded-(--radius-row) border border-(--line-row) bg-(--surface-row) px-5 py-[17px] font-sans text-(--ink-title) no-underline',
);

const ANCHOR = tw(
  'transition-[border-color,background,transform] duration-150 ease-[ease] hover:transform-[translateY(-2px)] hover:border-(--accent-cyan) hover:bg-[rgba(4,254,255,0.08)]',
);

const VALUE = tw('text-(length:--text-ui) text-(--ink-ice)');

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
  const { label, value, action, className, ...rest } = props;

  if (rest.href === undefined) {
    return (
      <div className={cn(BASE, 'flex-wrap px-5 py-3', className)} {...rest}>
        <strong>{label}</strong>
        <span className='flex items-center gap-3'>
          {value ? <span className={VALUE}>{value}</span> : null}
          {action}
        </span>
      </div>
    );
  }

  return (
    <a className={cn(BASE, ANCHOR, className)} {...rest}>
      <strong>{label}</strong>
      {value ? <span className={VALUE}>{value}</span> : null}
    </a>
  );
};
