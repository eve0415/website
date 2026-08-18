import type { Hue } from './card';
import type { FC, ReactNode } from 'react';

import { tw } from '#routes/-/tw';

import { cn } from '../../cn';

const BASE = tw('inline-flex items-center rounded-[999px] border px-[10px] py-[2px] font-sans text-(length:--text-tag)');

const HUES = {
  cyan: tw('border-(--hue-cyan-line) text-(--hue-cyan)'),
  mint: tw('border-(--hue-mint-line) text-(--hue-mint)'),
  sky: tw('border-(--hue-sky-line) text-(--hue-sky)'),
  violet: tw('border-(--hue-violet-line) text-(--hue-violet)'),
  rose: tw('border-(--hue-rose-line) text-(--hue-rose)'),
} satisfies Record<Hue, string>;

interface TagProps {
  hue?: Hue;
  className?: string;
  children?: ReactNode;
}

export const Tag: FC<TagProps> = ({ hue = 'cyan', className, children }) => <span className={cn(BASE, HUES[hue], className)}>{children}</span>;
