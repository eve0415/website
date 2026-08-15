import type { FC } from 'react';

import { cn } from '../cn';

interface PageHeaderProps {
  kicker?: string;
  title?: string;
  lede?: string;
  className?: string;
}

export const PageHeader: FC<PageHeaderProps> = ({ kicker, title, lede, className }) => (
  <div className={cn('grid gap-[8px] font-sans', className)}>
    {kicker ? <p className='text-[length:var(--text-caption)] tracking-[var(--tracking-kicker)] text-[var(--ink-ice)]'>{kicker}</p> : null}
    <h1 className='text-[length:var(--text-h1)] leading-[1.2] font-bold text-[var(--ink-title)]'>{title}</h1>
    {lede ? <p className='text-[length:var(--text-body)] leading-[1.8] text-[var(--ink-muted)]'>{lede}</p> : null}
  </div>
);
