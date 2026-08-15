import type { FC, MouseEvent } from 'react';

import './site-header.css';

export interface SiteHeaderNavItem {
  key: string;
  label: string;
  href: string;
}

interface SiteHeaderProps {
  brand?: string;
  brandHref?: string;
  avatarSrc?: string;
  items?: readonly SiteHeaderNavItem[];
  active?: string;
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

export const SiteHeader: FC<SiteHeaderProps> = ({ brand = 'eve0415.net', brandHref = '#/', avatarSrc, items = DEFAULT_ITEMS, active = 'home', onSelect }) => {
  const handleBrandClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onSelect?.('home');
  };

  return (
    <header className='ev-hdr'>
      <a className='ev-hdr-brand' href={brandHref} onClick={onSelect === undefined ? undefined : handleBrandClick}>
        {avatarSrc ? (
          <img src={avatarSrc} alt='' width='32' height='32' style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(252,247,253,.4)' }} />
        ) : null}
        {brand}
      </a>
      <nav aria-label='メニュー' className='ev-hdr-nav'>
        {items.map(item =>
          onSelect === undefined ? (
            <a key={item.key} className='ev-hdr-link' href={item.href} aria-current={active === item.key ? 'page' : undefined}>
              {item.label}
            </a>
          ) : (
            <button
              key={item.key}
              type='button'
              className='ev-hdr-link'
              aria-current={active === item.key ? 'page' : undefined}
              onClick={() => {
                onSelect(item.key);
              }}
            >
              {item.label}
            </button>
          ),
        )}
      </nav>
      <span className='ev-hdr-line' aria-hidden='true'>
        <span />
      </span>
      <span className='ev-prg' aria-hidden='true'>
        <span className='ev-prg-b' />
        <span className='ev-prg-h' />
      </span>
    </header>
  );
};
