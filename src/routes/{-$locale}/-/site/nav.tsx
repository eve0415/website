import type { Locale } from '#i18n/locale';
import type { SiteHeaderNavItem } from './site-header';

import { Link } from '@tanstack/react-router';

import { SITE_COPY } from '#i18n/copy';
import { localeParams } from '#i18n/locale';

import { NAV_LINK_CLASS } from './header-classes';

/** Every item is a registered route, so the whole nav navigates client-side. */
export const navItems = (locale: Locale): readonly SiteHeaderNavItem[] => [
  {
    key: 'home',
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
    element: (
      <Link to='/{-$locale}/projects' params={localeParams(locale)} className={NAV_LINK_CLASS}>
        {SITE_COPY[locale].navProjects}
      </Link>
    ),
  },
  {
    key: 'skills',
    element: (
      <Link to='/{-$locale}/skills' params={localeParams(locale)} className={NAV_LINK_CLASS}>
        {SITE_COPY[locale].navSkills}
      </Link>
    ),
  },
  {
    key: 'links',
    element: (
      <Link to='/{-$locale}/links' params={localeParams(locale)} className={NAV_LINK_CLASS}>
        {SITE_COPY[locale].navLinks}
      </Link>
    ),
  },
  {
    key: 'about',
    element: (
      <Link to='/{-$locale}/about' params={localeParams(locale)} className={NAV_LINK_CLASS}>
        {SITE_COPY[locale].navAbout}
      </Link>
    ),
  },
];
