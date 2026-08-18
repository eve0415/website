import type { FC, MouseEvent, ReactNode } from 'react';

import { Fragment } from 'react';

import { cn } from '#lib/cn';

import './site-header.css';
import { tw } from '#lib/tw';

const ROOT = tw('ev-hdr sticky top-0 z-10 border-b border-b-(--line-header) bg-(--surface-header) p-(--header-pad) font-sans backdrop-blur-[10px]');

/** The bar stays full-bleed; only its contents stop at the shell width. */
const INNER = tw('mx-auto flex max-w-(--page-max-wide) items-center justify-between gap-[12px]');

/** Exported so a caller supplying its own `brandElement` can style it identically. */
export const BRAND_CLASS = tw('flex min-h-[44px] items-center gap-[10px] text-[1rem] font-bold text-[#eae6ff] no-underline');

/** Exported so a caller supplying its own `element` can style it identically. */
export const NAV_LINK_CLASS = tw(
  'inline-flex min-h-[44px] cursor-pointer items-center border-b-2 border-b-transparent font-[inherit] text-(length:--text-nav) text-[#eae6ff] no-underline hover:text-(--accent-cyan) aria-[current=page]:border-b-(--accent-cyan) aria-[current=page]:text-(--accent-cyan)',
);

export interface SiteHeaderNavItem {
  key: string;
  label: string;
  href: string;
  /**
   * Rendered instead of the plain anchor — how a router link gets in without
   * this component learning about routing. Style it with `NAV_LINK_CLASS` and
   * own its own `aria-current`.
   */
  element?: ReactNode;
}

interface SiteHeaderProps {
  /**
   * The nav landmark's accessible name. Required rather than defaulted: it is
   * the one prop here that has to be in the reader's language, and a default
   * would ship silently in the wrong one — which is exactly what it used to do.
   */
  navLabel: string;
  brand?: string;
  brandHref?: string;
  avatarSrc?: string;
  /**
   * Rendered instead of the plain brand anchor — the same escape hatch
   * `SiteHeaderNavItem.element` is, and how a router link gets in without this
   * component learning about routing. Style it with `BRAND_CLASS`.
   */
  brandElement?: ReactNode;
  items?: readonly SiteHeaderNavItem[];
  active?: string;
  className?: string;
  /** Trailing slot inside the nav — where the design puts the language switch. */
  children?: ReactNode;
  /**
   * When supplied the nav renders as buttons and the brand link is intercepted,
   * so routing stays entirely at the call site.
   */
  onSelect?: (key: string) => void;
}

const DEFAULT_ITEMS: readonly SiteHeaderNavItem[] = [
  { key: 'home', label: 'ホーム', href: '#/' },
  { key: 'projects', label: '作ったもの', href: '#/projects' },
  { key: 'skills', label: 'できること', href: '#/skills' },
  { key: 'links', label: 'つながる', href: '#/links' },
  { key: 'about', label: 'About', href: '#/about' },
];

export const SiteHeader: FC<SiteHeaderProps> = ({
  navLabel,
  brand = 'eve0415.net',
  brandHref = '#/',
  avatarSrc,
  brandElement,
  items = DEFAULT_ITEMS,
  active = 'home',
  className,
  children,
  onSelect,
}) => {
  const handleBrandClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onSelect?.('home');
  };

  return (
    <header className={cn(ROOT, className)}>
      <div className={INNER}>
        {brandElement === undefined ? (
          <a className={BRAND_CLASS} href={brandHref} onClick={onSelect === undefined ? undefined : handleBrandClick}>
            {avatarSrc ? (
              <img src={avatarSrc} alt='' width='32' height='32' className='size-[32px] rounded-[50%] border border-[rgba(252,247,253,.4)]' />
            ) : null}
            {brand}
          </a>
        ) : (
          brandElement
        )}
        <nav aria-label={navLabel} className='flex flex-wrap items-center justify-end gap-[clamp(10px,2vw,22px)]'>
          {items.map(item =>
            item.element === undefined ? (
              onSelect === undefined ? (
                <a key={item.key} className={NAV_LINK_CLASS} href={item.href} aria-current={active === item.key ? 'page' : undefined}>
                  {item.label}
                </a>
              ) : (
                <button
                  key={item.key}
                  type='button'
                  className={NAV_LINK_CLASS}
                  aria-current={active === item.key ? 'page' : undefined}
                  onClick={() => {
                    onSelect(item.key);
                  }}
                >
                  {item.label}
                </button>
              )
            ) : (
              <Fragment key={item.key}>{item.element}</Fragment>
            ),
          )}
          {children}
        </nav>
      </div>
      <span
        className='ev-hdr-line pointer-events-none absolute inset-x-0 -bottom-px h-[2px] opacity-0 transition-opacity duration-[0.4s] ease-(--ease-comet)'
        aria-hidden='true'
      >
        <span />
      </span>
      <span className='ev-prg pointer-events-none absolute inset-x-0 -bottom-px h-[2px] opacity-0' aria-hidden='true'>
        <span className='ev-prg-b' />
        <span className='ev-prg-h' />
      </span>
    </header>
  );
};
