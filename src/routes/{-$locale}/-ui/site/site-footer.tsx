import type { FC, ReactNode } from 'react';

import { cn } from '../cn';

const ROOT =
  'relative flex flex-wrap items-center gap-[18px] border-t border-t-[var(--line-header)] bg-[radial-gradient(120%_220%_at_50%_135%,var(--ev-footer-glow,rgba(142,70,217,.16)),transparent_60%)] p-[20px_clamp(20px,4vw,40px)_26px] font-sans text-[length:var(--text-small)] text-[var(--ink-faint)]';

interface SiteFooterProps {
  /** Trailing note, right-aligned; pass an empty string to drop it. */
  note?: string;
  className?: string;
  children?: ReactNode;
}

export const SiteFooter: FC<SiteFooterProps> = ({ note = 'View Transitions / Scroll-driven Animations / Popover API 使用', className, children }) => (
  <footer className={cn(ROOT, className)}>
    <span>© eve0415</span>
    {children}
    {note ? <span className='ml-auto text-[13px]'>{note}</span> : null}
  </footer>
);
