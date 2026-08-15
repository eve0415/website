import type { Hue } from './card';
import type { FC, ReactNode } from 'react';

import { cn } from '../cn';

const BASE = 'inline-flex items-center rounded-[999px] border px-[10px] py-[2px] font-sans text-[length:var(--text-tag)]';

const HUES = {
  cyan: 'border-[var(--hue-cyan-line)] text-[var(--hue-cyan)]',
  mint: 'border-[var(--hue-mint-line)] text-[var(--hue-mint)]',
  sky: 'border-[var(--hue-sky-line)] text-[var(--hue-sky)]',
  violet: 'border-[var(--hue-violet-line)] text-[var(--hue-violet)]',
  rose: 'border-[var(--hue-rose-line)] text-[var(--hue-rose)]',
};

interface TagProps {
  hue?: Hue;
  className?: string;
  children?: ReactNode;
}

export const Tag: FC<TagProps> = ({ hue = 'cyan', className, children }) => <span className={cn(BASE, HUES[hue], className)}>{children}</span>;
