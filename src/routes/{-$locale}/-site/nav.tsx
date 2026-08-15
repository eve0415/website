import type { Locale } from '#i18n/locale';
import type { SiteHeaderNavItem } from '../-ui/site/site-header';

import { Link } from '@tanstack/react-router';

import { SITE_COPY } from '#i18n/copy';
import { localePath } from '#i18n/locale';

import { NAV_LINK_CLASS } from '../-ui/site/site-header';

/**
 * Home is a registered route, so it navigates client-side. The other four are
 * not routes yet — `<Link to>` is typed against the route tree and would not
 * compile — so they are plain hrefs at their canonical per-locale paths and
 * become links the moment those pages land.
 */
export const navItems = (locale: Locale): readonly SiteHeaderNavItem[] => [
  {
    key: 'home',
    label: SITE_COPY[locale].navHome,
    href: localePath(locale, '/'),
    element: (
      <Link to='/{-$locale}' params={{ locale: locale === 'en' ? 'en' : undefined }} className={NAV_LINK_CLASS}>
        {SITE_COPY[locale].navHome}
      </Link>
    ),
  },
  { key: 'projects', label: SITE_COPY[locale].navProjects, href: localePath(locale, '/projects') },
  { key: 'skills', label: SITE_COPY[locale].navSkills, href: localePath(locale, '/skills') },
  { key: 'links', label: SITE_COPY[locale].navLinks, href: localePath(locale, '/links') },
  { key: 'about', label: SITE_COPY[locale].navAbout, href: localePath(locale, '/about') },
];

/**
 * Which nav item carries `aria-current="page"`. Derived from the URL rather
 * than passed down, so a page never has to remember to declare itself.
 */
export const activeNavKey = (locale: Locale, pathname: string): string => {
  const rest = locale === 'en' ? pathname.slice('/en'.length) : pathname;
  const segment = rest.split('/')[1] ?? '';
  return segment === '' ? 'home' : segment;
};
