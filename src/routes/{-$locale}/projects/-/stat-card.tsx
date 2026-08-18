import type { Hue } from '../../-/ui/surfaces/card';
import type { FC } from 'react';

import { cn } from '../../-/cn';
import { Card } from '../../-/ui/surfaces/card';

const VALUE = {
  cyan: 'text-(--accent-cyan)',
  mint: 'text-(--accent-mint)',
  sky: 'text-(--hue-sky)',
  violet: 'text-(--hue-violet)',
  rose: 'text-(--hue-rose)',
} satisfies Record<Hue, string>;

interface StatCardProps {
  hue: Hue;
  value: string;
  label: string;
  /** The breakdown line under the figure, as the download counts have. */
  note?: string;
}

export const StatCard: FC<StatCardProps> = ({ hue, value, label, note }) => (
  <Card className='grid content-start gap-[4px] p-[20px_22px]'>
    <span className={cn('text-[clamp(1.625rem,3vw,2.125rem)] leading-[1.1] font-bold', VALUE[hue])}>{value}</span>
    <span className='text-(length:--text-caption) text-(--ink-ice)'>{label}</span>
    {note === undefined ? null : <span className='text-[0.78125rem] leading-[1.7] text-[#9a93c8]'>{note}</span>}
  </Card>
);
