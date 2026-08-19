import type { FC, ReactNode } from 'react';

import { Fragment } from 'react';

import './site-header.css';
import { tw } from '#lib/tw';

const ROOT = tw('ev-hdr ev-on-sky sticky top-0 z-10 border-b border-b-(--line-header) bg-(--surface-header) p-(--header-pad) font-sans backdrop-blur-[10px]');

/** The bar stays full-bleed; only its contents stop at the shell width. */
const INNER = tw('mx-auto flex max-w-(--page-max-wide) items-center justify-between gap-3');

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
  /** The brand link, styled with `BRAND_CLASS`. Routing stays at the call site. */
  brandElement: ReactNode;
  items: readonly SiteHeaderNavItem[];
  /** Trailing slot inside the nav — where the design puts the language switch. */
  children?: ReactNode;
}

export const SiteHeader: FC<SiteHeaderProps> = ({ navLabel, brandElement, items, children }) => (
  <header className={ROOT}>
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
