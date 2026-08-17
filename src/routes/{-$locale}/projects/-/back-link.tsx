import type { Locale } from '#i18n/locale';
import type { FC } from 'react';

import { Link } from '@tanstack/react-router';

import { PROJECT_COPY } from '#i18n/copy';

import { localeParams } from '../../-/site/links';

const ROOT =
  'inline-flex min-h-[44px] animate-[fadeUp_0.6s_ease_backwards] items-center gap-[8px] justify-self-start text-(length:--text-nav) font-bold text-(--ink-ice) no-underline transition-colors duration-150 ease-[ease] hover:text-(--accent-cyan)';

interface BackLinkProps {
  locale: Locale;
}

/** "← 作ったもの", the first thing on every project detail page. */
export const BackLink: FC<BackLinkProps> = ({ locale }) => (
  // `exact`: without it `/projects` prefix-matches the detail route this link
  // sits on, and the way back would announce itself as the current page.
  <Link to='/{-$locale}/projects' params={localeParams(locale)} activeOptions={{ exact: true }} className={ROOT}>
    {PROJECT_COPY[locale].backWorks}
  </Link>
);
