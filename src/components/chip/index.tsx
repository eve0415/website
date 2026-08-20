import type { ComponentPropsWithoutRef, FC, ReactNode } from 'react';

import { cn } from '#lib/cn';
import { tw } from '#lib/tw';

/**
 * `daily` is the design's "bright outline" — the skills page legend reads it as
 * a tool that is in hand most days, so it is a claim about the item, not a size
 * or a colour the caller picks.
 */
type ChipVariant = 'plain' | 'daily';

const BASE = tw('inline-flex items-center rounded-[999px] border px-[15px] py-[7px] font-sans text-(length:--text-small)');

const VARIANT = {
  plain: tw('border-(--line-chip) text-(--ink-chip)'),
  daily: tw('border-(--line-chip-daily) bg-(--surface-chip-daily) text-(--ink-chip-daily) shadow-(--glow-chip-daily)'),
} satisfies Record<ChipVariant, string>;

/**
 * The design lights the border and the label together on hover, and keyboard
 * focus gets the same lighting. The ring itself is no longer here: the UA
 * default measures 1.02:1 against this sky, so `__root.css` now carries one
 * `:focus-visible` rule for every focusable rather than this component alone.
 */
const ANCHOR = tw(
  'no-underline transition-[border-color,color] duration-150 ease-[ease] hover:border-(--accent-cyan) hover:text-(--accent-cyan) focus-visible:border-(--accent-cyan) focus-visible:text-(--accent-cyan)',
);

interface ChipBaseProps {
  variant?: ChipVariant;
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
  const { variant = 'plain', className, children, ...rest } = props;

  if (rest.href === undefined) {
    return (
      <span className={cn(BASE, VARIANT[variant], className)} {...rest}>
        {children}
      </span>
    );
  }

  return (
    <a className={cn(BASE, VARIANT[variant], ANCHOR, className)} {...rest}>
      {children}
    </a>
  );
};
