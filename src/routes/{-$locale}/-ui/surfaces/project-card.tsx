import type { Hue } from './card';
import type { CSSProperties, ComponentPropsWithoutRef, FC } from 'react';

import { Card } from './card';
import { Tag } from './tag';

const STAT = {
  cyan: 'var(--accent-cyan, #04feff)',
  mint: 'var(--accent-mint, #00dda8)',
  sky: 'var(--hue-sky, #7dd2ff)',
  violet: 'var(--hue-violet, #e2a9ff)',
  rose: 'var(--hue-rose, #ffb3cd)',
};

interface ProjectCardBaseProps {
  name?: string;
  tag?: string;
  hue?: Hue;
  description?: string;
  stat?: string;
  statLabel?: string;
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
  const { name, tag, hue = 'cyan', description, stat, statLabel, featured = false, ...rest } = props;
  const statColor = STAT[hue];

  const body = featured ? (
    <>
      <span style={{ display: 'grid', gap: 8, flex: '1 1 320px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink-title, #fcf7fd)' }}>{name}</span>
          {tag ? <Tag hue={hue}>{tag}</Tag> : null}
        </span>
        <span style={{ fontSize: 'var(--text-body, 15.5px)', lineHeight: 1.75, color: 'var(--ink-muted, #cfc9f2)' }}>{description}</span>
      </span>
      {stat ? (
        <span style={{ display: 'grid', gap: 2, textAlign: 'right' }}>
          <span style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: statColor, lineHeight: 1.1 }}>{stat}</span>
          {statLabel ? <span style={{ fontSize: 13, color: 'var(--ink-ice, #9fe8ff)' }}>{statLabel}</span> : null}
        </span>
      ) : null}
    </>
  ) : (
    <>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 'var(--text-card-title, 20px)', fontWeight: 700, color: 'var(--ink-title, #fcf7fd)' }}>{name}</span>
        {tag ? <Tag hue={hue}>{tag}</Tag> : null}
      </span>
      <p style={{ margin: 0, fontSize: 'var(--text-body, 15.5px)', lineHeight: 1.75, color: 'var(--ink-muted, #cfc9f2)' }}>{description}</p>
      {stat ? <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: statColor }}>{stat}</p> : null}
    </>
  );

  const style: CSSProperties = featured
    ? {
        borderColor: 'var(--line-accent-dashed, rgba(4,254,255,.35))',
        borderRadius: 'var(--radius-card-lg, 18px)',
        padding: 'var(--pad-card-lg, 26px)',
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
      }
    : { display: 'grid', gap: 10, alignContent: 'start' };

  // `href` stays inside `rest` so that narrowing on it also resolves the spread
  // to Card's matching anchor/div member; the two branches are not interchangeable.
  if (rest.href === undefined) {
    return (
      <Card hue={hue} style={style} {...rest}>
        {body}
      </Card>
    );
  }

  return (
    <Card hue={hue} style={style} {...rest}>
      {body}
    </Card>
  );
};
