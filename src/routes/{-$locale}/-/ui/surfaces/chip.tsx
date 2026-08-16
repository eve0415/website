import type { ComponentPropsWithoutRef, FC, ReactNode } from 'react';

import { cn } from '../../cn';

const BASE =
  'inline-flex items-center rounded-[999px] border border-[var(--line-chip)] px-[15px] py-[7px] font-sans text-[length:var(--text-small)] text-[#e4dfff]';

/** The design lights the border and the label together on hover. */
const ANCHOR = 'no-underline transition-[border-color,color] duration-150 ease-[ease] hover:border-(--accent-cyan) hover:text-(--accent-cyan)';

interface ChipBaseProps {
  children?: ReactNode;
}

interface ChipAnchorProps extends ChipBaseProps, Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'children'> {
  href: string;
}

interface ChipSpanProps extends ChipBaseProps, Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  href?: undefined;
}

type ChipProps = ChipAnchorProps | ChipSpanProps;

export const Chip: FC<ChipProps> = props => {
  const { className, children, ...rest } = props;

  if (rest.href === undefined) {
    return (
      <span className={cn(BASE, className)} {...rest}>
        {children}
      </span>
    );
  }

  return (
    <a className={cn(BASE, ANCHOR, className)} {...rest}>
      {children}
    </a>
  );
};
