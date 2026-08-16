import type { FC } from 'react';

import { cn } from '../../-/cn';
import { Card } from '../../-/ui/surfaces/card';
import { Chip } from '../../-/ui/surfaces/chip';

/**
 * Each group heading gets its own colour in the design. The first is ice rather
 * than the cyan of the project hues, so this is its own scale.
 */
export type SkillInk = 'ice' | 'mint' | 'sky' | 'violet' | 'rose';

const INK = {
  ice: 'text-(--ink-ice)',
  mint: 'text-(--hue-mint)',
  sky: 'text-(--hue-sky)',
  violet: 'text-(--hue-violet)',
  rose: 'text-(--hue-rose)',
};

export interface SkillItem {
  label: string;
  /** Absent for the "what I usually build" group, whose chips are not products. */
  href?: string;
}

interface SkillGroupProps {
  ink: SkillInk;
  heading: string;
  items: readonly SkillItem[];
  className?: string;
}

export const SkillGroup: FC<SkillGroupProps> = ({ ink, heading, items, className }) => (
  <Card className={cn('grid content-start gap-[14px]', className)}>
    <h2 className={cn('text-(length:--text-panel-title) font-bold', INK[ink])}>{heading}</h2>
    {/* ev-stg staggers the chips in by sibling-index(), with no JavaScript. */}
    <div className='ev-stg flex flex-wrap gap-[8px]'>
      {items.map(item =>
        item.href === undefined ? (
          <Chip key={item.label}>{item.label}</Chip>
        ) : (
          <Chip key={item.label} href={item.href} target='_blank' rel='noopener'>
            {item.label}
          </Chip>
        ),
      )}
    </div>
  </Card>
);
