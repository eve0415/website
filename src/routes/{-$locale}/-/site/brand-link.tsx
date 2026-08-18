import type { Locale } from '#i18n/locale';
import type { FC } from 'react';

import { Link } from '@tanstack/react-router';

import { localeParams } from '../routed-links';

import { BRAND_CLASS } from './site-header';

interface BrandLinkProps {
  locale: Locale;
}

/**
 * The header's brand, as a typed router link rather than the design library's
 * plain anchor — the same swap `navItems` makes for the nav, through the
 * `brandElement` slot. Without it the one link on every page that goes home was
 * the one link that reloaded the document.
 *
 * `alt=''` on the avatar: the brand name follows it inside the same link, so a
 * described image would say the name twice.
 */
export const BrandLink: FC<BrandLinkProps> = ({ locale }) => (
  <Link to='/{-$locale}' params={localeParams(locale)} className={BRAND_CLASS}>
    <img src='/web-app-icon-192x192.png' alt='' width='32' height='32' className='size-[32px] rounded-[50%] border border-[rgba(252,247,253,.4)]' />
    eve0415.net
  </Link>
);
