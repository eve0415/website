import type { Locale } from '#i18n/locale';
import type { SiteHeaderNavItem } from './site-header';

import { Link } from '@tanstack/react-router';

import { SITE_COPY } from '#i18n/copy';
import { localePath } from '#i18n/locale';

import { localeParams } from './links';
import { NAV_LINK_CLASS } from './site-header';

/**
 * Every item is a registered route, so the whole nav navigates client-side.
 * `href` stays alongside `element` as the design library's own fallback for a
 * caller that supplies no element.
 */
export const navItems = (locale: Locale): readonly SiteHeaderNavItem[] => [
  {
    key: 'home',
    label: SITE_COPY[locale].navHome,
    href: localePath(locale, '/'),
    // Without `exact` every path matches `/`, so home would read as the current
    // page everywhere. 作ったもの deliberately keeps the prefix match: the
    // design marks it current on the project pages too.
    element: (
      <Link to='/{-$locale}' params={localeParams(locale)} className={NAV_LINK_CLASS} activeOptions={{ exact: true }}>
        {SITE_COPY[locale].navHome}
      </Link>
    ),
  },
  {
    key: 'projects',
    label: SITE_COPY[locale].navProjects,
    href: localePath(locale, '/projects'),
    element: (
      <Link to='/{-$locale}/projects' params={localeParams(locale)} className={NAV_LINK_CLASS}>
        {SITE_COPY[locale].navProjects}
      </Link>
    ),
  },
  {
    key: 'skills',
    label: SITE_COPY[locale].navSkills,
    href: localePath(locale, '/skills'),
    element: (
      <Link to='/{-$locale}/skills' params={localeParams(locale)} className={NAV_LINK_CLASS}>
        {SITE_COPY[locale].navSkills}
      </Link>
    ),
  },
  {
    key: 'links',
    label: SITE_COPY[locale].navLinks,
    href: localePath(locale, '/links'),
    element: (
      <Link to='/{-$locale}/links' params={localeParams(locale)} className={NAV_LINK_CLASS}>
        {SITE_COPY[locale].navLinks}
      </Link>
    ),
  },
  {
    key: 'about',
    label: SITE_COPY[locale].navAbout,
    href: localePath(locale, '/about'),
    element: (
      <Link to='/{-$locale}/about' params={localeParams(locale)} className={NAV_LINK_CLASS}>
        {SITE_COPY[locale].navAbout}
      </Link>
    ),
  },
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
