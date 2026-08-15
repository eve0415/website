import type { FC, ReactNode } from 'react';

import { cn } from '../cn';

const BASE =
  'inline-flex items-center rounded-[999px] border border-[var(--line-chip)] px-[15px] py-[7px] font-sans text-[length:var(--text-small)] text-[#e4dfff]';

interface ChipProps {
  className?: string;
  children?: ReactNode;
}

export const Chip: FC<ChipProps> = ({ className, children }) => <span className={cn(BASE, className)}>{children}</span>;
