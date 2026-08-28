import type { Locale } from '#i18n/locale';
import type { FC } from 'react';

import { Link } from '@tanstack/react-router';

import { localeParams } from '#i18n/locale';

import brandAvatar from './brand-avatar-96x96.webp';
import { BRAND_CLASS } from './header-classes';

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
    <img src={brandAvatar} alt='' width='32' height='32' className='size-8 rounded-[50%] border border-[rgba(252,247,253,.4)]' />
    eve0415.net
  </Link>
);
