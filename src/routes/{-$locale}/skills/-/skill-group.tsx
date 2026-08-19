import type { FC } from 'react';

import { Card } from '#components/card';
import { Chip } from '#components/chip';
import { cn } from '#lib/cn';
import { tw } from '#lib/tw';

/**
 * Each group heading gets its own colour in the design. The first is ice rather
 * than the cyan of the project hues, so this is its own scale.
 */
export type SkillInk = 'ice' | 'mint' | 'sky' | 'violet' | 'rose';

const INK = {
  ice: tw('text-(--ink-ice)'),
  mint: tw('text-(--hue-mint)'),
  sky: tw('text-(--hue-sky)'),
  violet: tw('text-(--hue-violet)'),
  rose: tw('text-(--hue-rose)'),
} satisfies Record<SkillInk, string>;

export interface SkillItem {
  label: string;
  href: string;
}

interface SkillGroupProps {
  ink: SkillInk;
  heading: string;
  items: readonly SkillItem[];
  className?: string;
}

export const SkillGroup: FC<SkillGroupProps> = ({ ink, heading, items, className }) => (
  <Card className={cn('grid content-start gap-3.5', className)}>
    <h2 className={cn('text-(length:--text-panel-title) font-bold', INK[ink])}>{heading}</h2>
    {/* ev-stg staggers the chips in by sibling-index(), with no JavaScript. */}
    <div className='ev-stg flex flex-wrap gap-2'>
      {items.map(item => (
        <Chip key={item.label} href={item.href} target='_blank' rel='noopener'>
          {item.label}
        </Chip>
      ))}
    </div>
  </Card>
);
