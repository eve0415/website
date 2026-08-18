import type { FC, ReactNode } from 'react';

import { tw } from '#routes/-/tw';

import { cn } from '../cn';

const ROOT = tw(
  'relative border-t border-t-(--line-header) bg-[radial-gradient(120%_220%_at_50%_135%,var(--ev-footer-glow,rgba(142,70,217,.16)),transparent_60%)] p-[20px_clamp(20px,4vw,40px)_26px] font-sans text-(length:--text-small) text-(--ink-faint)',
);

/** The bar stays full-bleed; only its contents stop at the shell width. */
const INNER = tw('mx-auto flex max-w-(--page-max-wide) flex-wrap items-center gap-[18px]');

interface SiteFooterProps {
  className?: string;
  /** Anything trailing the copyright; the design's own is the dwell line. */
  children?: ReactNode;
}

export const SiteFooter: FC<SiteFooterProps> = ({ className, children }) => (
  <footer className={cn(ROOT, className)}>
    <div className={INNER}>
      <span>© eve0415</span>
      {children}
    </div>
  </footer>
);
