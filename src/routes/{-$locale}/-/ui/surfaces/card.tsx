import type { CSSProperties, ComponentPropsWithoutRef, FC, ReactNode } from 'react';

import { tw } from '#routes/-/tw';

import { cn } from '../../cn';

/** Project accent hue, shared by Card, Tag and ProjectCard. */
export type Hue = 'cyan' | 'mint' | 'sky' | 'violet' | 'rose';

type CardVariant = 'solid' | 'soft' | 'dashed';

const BASE = tw('block rounded-(--radius-card) border border-(--line-panel) bg-(--surface-panel) p-(--pad-card) font-sans text-inherit no-underline');

const VARIANT = {
  solid: '',
  soft: tw('bg-(--surface-panel-soft)'),
  dashed: tw('border-dashed border-(--line-accent-dashed) bg-(--surface-panel-soft)'),
} satisfies Record<CardVariant, string>;

const HOVER = tw('transition-[transform,border-color,box-shadow] duration-150 ease-[ease] hover:transform-(--lift-hover)');

const HUE_HOVER = {
  cyan: tw('hover:border-[rgba(4,254,255,.6)] hover:shadow-[0_10px_36px_var(--hue-cyan-glow)]'),
  mint: tw('hover:border-[rgba(0,221,168,.6)] hover:shadow-[0_10px_36px_var(--hue-mint-glow)]'),
  sky: tw('hover:border-[rgba(4,176,236,.65)] hover:shadow-[0_10px_36px_var(--hue-sky-glow)]'),
  violet: tw('hover:border-[rgba(196,73,208,.65)] hover:shadow-[0_10px_36px_var(--hue-violet-glow)]'),
  rose: tw('hover:border-[rgba(247,105,151,.6)] hover:shadow-[0_10px_36px_var(--hue-rose-glow)]'),
} satisfies Record<Hue, string>;

interface CardBaseProps {
  hue?: Hue;
  variant?: CardVariant;
  style?: CSSProperties;
  children?: ReactNode;
}

interface CardAnchorProps extends CardBaseProps, Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'style' | 'children'> {
  href: string;
}

interface CardDivProps extends CardBaseProps, Omit<ComponentPropsWithoutRef<'div'>, 'style' | 'children'> {
  href?: undefined;
}

export type CardProps = CardAnchorProps | CardDivProps;

export const Card: FC<CardProps> = props => {
  const { hue = 'cyan', variant = 'solid', className, style, children, ...rest } = props;
  const interactive = props.href !== undefined || props.onClick !== undefined;
  const cls = cn(BASE, VARIANT[variant], interactive && HOVER, interactive && HUE_HOVER[hue], className);

  if (rest.href === undefined) {
    return (
      <div className={cls} style={style} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <a className={cls} style={style} {...rest}>
      {children}
    </a>
  );
};
