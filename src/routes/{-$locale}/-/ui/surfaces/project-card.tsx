import type { Hue } from './card';
import type { ComponentPropsWithoutRef, FC } from 'react';

import { cn } from '../../cn';

import { Card } from './card';
import { Tag } from './tag';

const STAT = {
  cyan: 'text-[var(--accent-cyan)]',
  mint: 'text-[var(--accent-mint)]',
  sky: 'text-[var(--hue-sky)]',
  violet: 'text-[var(--hue-violet)]',
  rose: 'text-[var(--hue-rose)]',
};

const LAYOUT = {
  featured: 'flex flex-wrap items-center justify-between gap-[24px] rounded-[var(--radius-card-lg)] border-[var(--line-accent-dashed)] p-[var(--pad-card-lg)]',
  plain: 'grid content-start gap-[10px]',
};

const TITLE_ROW = 'flex flex-wrap items-center gap-[10px]';
const DESCRIPTION = 'text-[length:var(--text-body)] leading-[1.75] text-[var(--ink-muted)]';
/** Reads as a link cue, so it keeps the ice hue whatever the card's hue is. */
const CTA = 'text-[14px] font-bold text-[var(--hue-cyan)]';

interface ProjectCardBaseProps {
  name?: string;
  tag?: string;
  hue?: Hue;
  description?: string;
  stat?: string;
  statLabel?: string;
  /** Trailing "read more" line; the arrow belongs to the string. */
  cta?: string;
  featured?: boolean;
}

interface ProjectCardAnchorProps extends ProjectCardBaseProps, Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'style' | 'children'> {
  href: string;
}

interface ProjectCardDivProps extends ProjectCardBaseProps, Omit<ComponentPropsWithoutRef<'div'>, 'style' | 'children'> {
  href?: undefined;
}

type ProjectCardProps = ProjectCardAnchorProps | ProjectCardDivProps;

export const ProjectCard: FC<ProjectCardProps> = props => {
  const { name, tag, hue = 'cyan', description, stat, statLabel, cta, featured = false, className, ...rest } = props;
  const statColor = STAT[hue];

  const body = featured ? (
    <>
      <span className='grid flex-[1_1_320px] gap-[8px]'>
        <span className={TITLE_ROW}>
          <span className='text-[22px] font-bold text-(--ink-title)'>{name}</span>
          {tag ? <Tag hue={hue}>{tag}</Tag> : null}
        </span>
        <span className={DESCRIPTION}>{description}</span>
        {cta ? <span className={CTA}>{cta}</span> : null}
      </span>
      {stat ? (
        <span className='grid gap-[2px] text-right'>
          <span className={cn('text-[clamp(28px,4vw,40px)] leading-[1.1] font-bold', statColor)}>{stat}</span>
          {statLabel ? <span className='text-[13px] text-(--ink-ice)'>{statLabel}</span> : null}
        </span>
      ) : null}
    </>
  ) : (
    <>
      <span className={TITLE_ROW}>
        <span className='text-(length:--text-card-title) font-bold text-(--ink-title)'>{name}</span>
        {tag ? <Tag hue={hue}>{tag}</Tag> : null}
      </span>
      <p className={DESCRIPTION}>{description}</p>
      {stat ? <p className={cn('text-[16px] font-bold', statColor)}>{stat}</p> : null}
      {cta ? <span className={CTA}>{cta}</span> : null}
    </>
  );

  const cls = cn(featured ? LAYOUT.featured : LAYOUT.plain, className);

  // `href` stays inside `rest` so that narrowing on it also resolves the spread
  // to Card's matching anchor/div member; the two branches are not interchangeable.
  if (rest.href === undefined) {
    return (
      <Card hue={hue} className={cls} {...rest}>
        {body}
      </Card>
    );
  }

  return (
    <Card hue={hue} className={cls} {...rest}>
      {body}
    </Card>
  );
};
