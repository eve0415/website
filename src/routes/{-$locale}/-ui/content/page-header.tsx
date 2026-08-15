import type { FC, ReactNode } from 'react';

import { cn } from '../cn';

interface PageHeaderProps {
  kicker?: string;
  title?: string;
  lede?: string;
  /** Tags sitting on the title's own line, as the project pages have them. */
  tags?: ReactNode;
  className?: string;
}

const TITLE = 'text-(length:--text-h1) leading-[1.2] font-bold text-(--ink-title) [text-box:trim-both_cap_alphabetic]';

export const PageHeader: FC<PageHeaderProps> = ({ kicker, title, lede, tags, className }) => (
  <div className={cn('grid gap-[8px] font-sans', className)}>
    {kicker ? <p className='text-(length:--text-caption) tracking-(--tracking-kicker) text-(--ink-ice)'>{kicker}</p> : null}
    {tags === undefined ? (
      <h1 className={TITLE}>{title}</h1>
    ) : (
      <div className='flex flex-wrap items-center gap-[14px]'>
        <h1 className={TITLE}>{title}</h1>
        {tags}
      </div>
    )}
    {lede ? <p className='text-(length:--text-body) leading-[1.8] text-(--ink-muted)'>{lede}</p> : null}
  </div>
);
