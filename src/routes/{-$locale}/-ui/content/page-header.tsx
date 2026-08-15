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
    {kicker ? <p className='text-(length:--text-caption) tracking-(--tracking-kicker) text-(--ink-ice)'>{kicker}</p> : null}
    <h1 className='text-(length:--text-h1) leading-[1.2] font-bold text-(--ink-title)'>{title}</h1>
    {lede ? <p className='text-(length:--text-body) leading-[1.8] text-(--ink-muted)'>{lede}</p> : null}
  </div>
);
