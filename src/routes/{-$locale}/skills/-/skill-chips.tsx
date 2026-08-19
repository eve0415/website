import type { FC } from 'react';

import { Chip } from '#components/chip';

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
      <Chip key={item.label} variant={item.daily === true ? 'daily' : 'plain'} href={item.href} target='_blank' rel='noopener'>
        {item.label}
      </Chip>
    ))}
  </div>
);
