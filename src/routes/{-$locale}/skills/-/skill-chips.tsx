import type { FC } from 'react';

import { Chip } from '#components/chip';

export interface SkillItem {
  label: string;
  href: string;
  /** Bright outline, which the page's legend reads as "in hand most days". */
  daily?: boolean;
}

/**
 * The bright outline is a colour-only cue, so every daily chip also says the
 * thing the outline means, for a reader who cannot see it. Same trade the
 * about page's inline link makes for WCAG 1.4.1.
 *
 * ev-stg staggers the chips in by sibling-index(), with no JavaScript.
 */
export const SkillChips: FC<{ items: readonly SkillItem[]; dailyLabel: string }> = ({ items, dailyLabel }) => (
  <div className='ev-stg flex flex-wrap gap-2'>
    {items.map(item => (
      <Chip key={item.label} variant={item.daily === true ? 'daily' : 'plain'} href={item.href} target='_blank' rel='noopener noreferrer nofollow'>
        {item.label}
        {item.daily === true ? <span className='sr-only'>{dailyLabel}</span> : null}
      </Chip>
    ))}
  </div>
);
