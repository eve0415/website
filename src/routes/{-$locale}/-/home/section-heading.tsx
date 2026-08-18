import type { FC, ReactNode } from 'react';

import { cn } from '#lib/cn';

interface SectionHeadingProps {
  className?: string;
  children?: ReactNode;
}

export const SectionHeading: FC<SectionHeadingProps> = ({ className, children }) => (
  <h2 className={cn('flex items-center gap-[14px] font-sans text-(length:--text-h2) font-bold text-(--ink-title)', className)}>
    {children}
    <span aria-hidden='true' className='h-px flex-1 bg-[linear-gradient(90deg,rgba(4,254,255,.45),transparent)]' />
  </h2>
);
