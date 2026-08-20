import type { FC, ReactNode } from 'react';

import { cn } from '#lib/cn';
import { tw } from '#lib/tw';

/* `ev-on-sky`, not `ev-on-clouds`: the bar sits on the page gradient's own
   bottom end, not over the cloud sea, so it takes that band's pale ink. It read
   the cloud band's dark ink and measured 3.3:1 at 17時半. */
const ROOT = tw(
  'ev-on-sky relative border-t border-t-(--line-header) bg-[radial-gradient(120%_220%_at_50%_135%,var(--sky-footer-glow),transparent_60%)] p-[20px_clamp(20px,4vw,40px)_26px] font-sans text-(length:--text-small) text-(--ink-faint)',
);

/** The bar stays full-bleed; only its contents stop at the shell width. */
const INNER = tw('mx-auto flex max-w-(--page-max-wide) flex-wrap items-center gap-4.5');

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
