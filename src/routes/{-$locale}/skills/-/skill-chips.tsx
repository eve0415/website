import type { FC } from 'react';

import { Chip } from '#components/chip';

/**
 * The bright outline is a colour-only cue, so the legend that explains it is
 * named as every daily chip's description rather than left to the eye. Same
 * trade the about page's inline link makes for WCAG 1.4.1.
 */
export const DAILY_LEGEND_ID = 'skills-daily-legend';

export interface SkillItem {
  label: string;
  href: string;
  /** Bright outline, which the page's legend reads as "in hand most days". */
  daily?: boolean;
}

/** ev-stg staggers the chips in by sibling-index(), with no JavaScript. */
export const SkillChips: FC<{ items: readonly SkillItem[] }> = ({ items }) => (
  <div className='ev-stg flex flex-wrap gap-2'>
    {items.map(item => (
      <Chip
        key={item.label}
        variant={item.daily === true ? 'daily' : 'plain'}
        aria-describedby={item.daily === true ? DAILY_LEGEND_ID : undefined}
        href={item.href}
        target='_blank'
        rel='noopener noreferrer nofollow'
      >
        {item.label}
      </Chip>
    ))}
  </div>
);
