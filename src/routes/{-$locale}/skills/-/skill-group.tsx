import type { HeadingInk } from '#components/card';
import type { SkillItem } from './skill-chips';
import type { FC } from 'react';

import { Card, HEADING_INK } from '#components/card';
import { cn } from '#lib/cn';

import { SkillChips } from './skill-chips';

interface SkillGroupProps {
  ink: HeadingInk;
  heading: string;
  items: readonly SkillItem[];
  dailyLabel: string;
  className?: string;
}

export const SkillGroup: FC<SkillGroupProps> = ({ ink, heading, items, dailyLabel, className }) => (
  <Card className={cn('grid content-start gap-3.5', className)}>
    <h2 className={cn('text-(length:--text-panel-title) font-bold', HEADING_INK[ink])}>{heading}</h2>
    <SkillChips items={items} dailyLabel={dailyLabel} />
  </Card>
);
