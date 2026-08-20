import type { FC, ReactNode } from 'react';

import { Fragment, useEffect, useRef } from 'react';

import './site-header.css';
import { tw } from '#lib/tw';

const ROOT = tw(
  'ev-hdr ev-on-clouds sticky top-0 z-10 border-b border-b-(--line-header) bg-(--surface-header) p-(--header-pad) font-sans backdrop-blur-[10px]',
);

/** The bar stays full-bleed; only its contents stop at the shell width. */
const INNER = tw('mx-auto flex max-w-(--page-max-wide) items-center justify-between gap-3');

/* `ev-on-panel` because the pill paints its own opaque #0d0836 and is only
   *inside* the header's band, not on it: taking the band's ink put dark navy on
   deep indigo — 1.2:1 by day, and this is the keyboard visitor's first move. */
const SKIP = tw(
  'ev-on-panel absolute top-2 left-2 z-20 -translate-y-[calc(100%+1rem)] rounded-xl border border-(--accent-cyan) bg-(--surface-toast) px-4 py-2 font-sans text-(length:--text-ui) text-(--ink-title) no-underline transition-transform duration-150 ease-(--ease-comet) focus-visible:translate-y-0',
);

export interface SiteHeaderNavItem {
  key: string;
  /**
   * The rendered link — how a router link gets in without this component
   * learning about routing. Style it with `NAV_LINK_CLASS` from
   * `./header-classes`; it sets its own `aria-current`.
   */
  element: ReactNode;
}

interface SiteHeaderProps {
  /**
   * The nav landmark's accessible name. Required rather than defaulted: it is
   * the one prop here that has to be in the reader's language, and a default
   * would ship silently in the wrong one — which is exactly what it used to do.
   */
  navLabel: string;
  /**
   * The bypass link's label, in the reader's language for the same reason
   * `navLabel` is. Its target is `#main`, which the `{-$locale}` layout owns —
   * the two have to be changed together.
   */
  skipLabel: string;
  /** The brand link, styled with `BRAND_CLASS`. Routing stays at the call site. */
  brandElement: ReactNode;
  items: readonly SiteHeaderNavItem[];
  /** Trailing slot inside the nav — where the design puts the language switch. */
  children?: ReactNode;
}

export const SiteHeader: FC<SiteHeaderProps> = ({ navLabel, skipLabel, brandElement, items, children }) => {
  const headerRef = useRef<HTMLElement>(null);

  /**
   * `--header-h` in `__root.css` is the one-row height, and `scroll-padding-top`
   * is set from it — but the bar wraps to two and three rows on a phone, and
   * grows again at a large root font, so the constant was only ever right at
   * >=768px. Left alone, the bypass link lands the visitor *under* the header
   * and a focused control can sit entirely behind it.
   *
   * `borderBoxSize` is already in CSS pixels, so it needs no undoing of the
   * ultra-wide `--z` zoom the way a `getBoundingClientRect()` height would.
   */
  useEffect(() => {
    const element = headerRef.current;
    if (element === null) return;

    const observer = new ResizeObserver(entries => {
      const size = entries[0]?.borderBoxSize[0];
      const height = size === undefined ? element.getBoundingClientRect().height / (element.currentCSSZoom || 1) : size.blockSize;
      document.documentElement.style.setProperty('--header-h', `${height}px`);
    });

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <header ref={headerRef} className={ROOT}>
      {/* Eight identical tab stops — brand, five nav items, two language pills —
        sit in front of `<main>` on all twenty pages, and the bar is sticky so
        they never scroll away. Parked above the viewport rather than in
        `sr-only`: that utility sets `position: static` when it is undone, which
        then fights the `absolute` needed to place it. */}
      <a href='#main' className={SKIP}>
        {skipLabel}
      </a>
      <div className={INNER}>
        {brandElement}
        <nav aria-label={navLabel} className='flex flex-wrap items-center justify-end gap-[clamp(10px,2vw,22px)]'>
          {items.map(item => (
            <Fragment key={item.key}>{item.element}</Fragment>
          ))}
          {children}
        </nav>
      </div>
      <span
        className='ev-hdr-line pointer-events-none absolute inset-x-0 -bottom-px h-0.5 opacity-0 transition-opacity duration-[0.4s] ease-(--ease-comet)'
        aria-hidden='true'
      >
        <span />
      </span>
      <span className='ev-prg pointer-events-none absolute inset-x-0 -bottom-px h-0.5 opacity-0' aria-hidden='true'>
        <span className='ev-prg-b' />
        <span className='ev-prg-h' />
      </span>
    </header>
  );
};
