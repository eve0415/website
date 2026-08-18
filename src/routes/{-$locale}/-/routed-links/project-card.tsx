import type { Hue } from '#components/card';
import type { ComponentPropsWithoutRef, FC } from 'react';

import { Card } from '#components/card';
import { Tag } from '#components/tag';
import { cn } from '#lib/cn';
import { tw } from '#lib/tw';

const STAT = {
  cyan: tw('text-(--accent-cyan)'),
  mint: tw('text-(--accent-mint)'),
  sky: tw('text-(--hue-sky)'),
  violet: tw('text-(--hue-violet)'),
  rose: tw('text-(--hue-rose)'),
} satisfies Record<Hue, string>;

const LAYOUT = {
  featured: tw('flex flex-wrap items-center justify-between gap-6 rounded-(--radius-card-lg) border-(--line-accent-dashed) p-(--pad-card-lg)'),
  plain: tw('grid content-start gap-2.5'),
};

const TITLE_ROW = tw('flex flex-wrap items-center gap-2.5');
const DESCRIPTION = tw('text-(length:--text-body) leading-[1.75] text-(--ink-muted)');
/** Reads as a link cue, so it keeps the ice hue whatever the card's hue is. */
const CTA = tw('text-(length:--text-small) font-bold text-(--hue-cyan)');

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
      <span className='grid flex-[1_1_320px] gap-2'>
        <span className={TITLE_ROW}>
          <span className='text-[1.375rem] font-bold text-(--ink-title)'>{name}</span>
          {tag ? <Tag hue={hue}>{tag}</Tag> : null}
        </span>
        <span className={DESCRIPTION}>{description}</span>
        {cta ? <span className={CTA}>{cta}</span> : null}
      </span>
      {stat ? (
        <span className='grid gap-0.5 text-right'>
          <span className={cn('text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.1] font-bold', statColor)}>{stat}</span>
          {statLabel ? <span className='text-(length:--text-caption) text-(--ink-ice)'>{statLabel}</span> : null}
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
      {stat ? <p className={cn('text-[1rem] font-bold', statColor)}>{stat}</p> : null}
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
