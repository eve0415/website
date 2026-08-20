import type { Locale } from '#i18n/locale';
import type { SiteHeaderNavItem } from './site-header';

import { Link } from '@tanstack/react-router';

import { SITE_COPY } from '#i18n/copy';
import { localeParams } from '#i18n/locale';

import { NAV_LINK_CLASS } from './header-classes';

/**
 * Without `exact` every path matches `/`, so home would read as the current page
 * everywhere. 作ったもの deliberately keeps the prefix match: the design marks it
 * current on the project pages too.
 */
const ITEMS = [
  { key: 'home', to: '/{-$locale}', copy: 'navHome', exact: true },
  { key: 'projects', to: '/{-$locale}/projects', copy: 'navProjects', exact: false },
  { key: 'skills', to: '/{-$locale}/skills', copy: 'navSkills', exact: false },
  { key: 'links', to: '/{-$locale}/links', copy: 'navLinks', exact: false },
  { key: 'about', to: '/{-$locale}/about', copy: 'navAbout', exact: false },
] as const;

/** Every item is a registered route, so the whole nav navigates client-side. */
export const navItems = (locale: Locale): readonly SiteHeaderNavItem[] =>
  ITEMS.map(item => ({
    key: item.key,
    element: (
      <Link to={item.to} params={localeParams(locale)} className={NAV_LINK_CLASS} activeOptions={{ exact: item.exact }}>
        {SITE_COPY[locale][item.copy]}
      </Link>
    ),
  }));
