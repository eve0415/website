import type { CSSProperties, ComponentPropsWithoutRef, FC, ReactNode } from 'react';

import './card.css';

/** Project accent hue, shared by Card, Tag and ProjectCard. */
export type Hue = 'cyan' | 'mint' | 'sky' | 'violet' | 'rose';

type CardVariant = 'solid' | 'soft' | 'dashed';

const HUES = {
  cyan: { line: 'rgba(4,254,255,.6)', glow: 'var(--hue-cyan-glow, rgba(4,176,236,.25))' },
  mint: { line: 'rgba(0,221,168,.6)', glow: 'var(--hue-mint-glow, rgba(0,221,168,.2))' },
  sky: { line: 'rgba(4,176,236,.65)', glow: 'var(--hue-sky-glow, rgba(4,176,236,.22))' },
  violet: { line: 'rgba(196,73,208,.65)', glow: 'var(--hue-violet-glow, rgba(142,70,217,.25))' },
  rose: { line: 'rgba(247,105,151,.6)', glow: 'var(--hue-rose-glow, rgba(247,105,151,.2))' },
};

/** `.ev-card--hover` reads these two custom properties for its hover state. */
interface CardHoverVars extends CSSProperties {
  '--ev-card-line-h': string;
  '--ev-card-glow-h': string;
}

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
  const { hue = 'cyan', variant = 'solid', style, children, ...rest } = props;
  const interactive = props.href !== undefined || props.onClick !== undefined;
  const tone = HUES[hue];
  const cls = `ev-card${variant === 'solid' ? '' : ` ev-card--${variant}`}${interactive ? ' ev-card--hover' : ''}`;
  const hoverStyle: CardHoverVars = { '--ev-card-line-h': tone.line, '--ev-card-glow-h': tone.glow, ...style };
  const resolvedStyle = interactive ? hoverStyle : style;

  if (rest.href === undefined) {
    return (
      <div className={cls} style={resolvedStyle} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <a className={cls} style={resolvedStyle} {...rest}>
      {children}
    </a>
  );
};
