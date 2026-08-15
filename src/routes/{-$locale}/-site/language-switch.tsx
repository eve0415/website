import type { Locale } from '#i18n/locale';
import type { FC } from 'react';

import { Link } from '@tanstack/react-router';

import { SITE_COPY } from '#i18n/copy';

import { cn } from '../-ui/cn';

const GROUP = 'inline-flex items-center rounded-[999px] border border-(--line-header) p-[2px]';

const PILL =
  'inline-flex min-h-[40px] min-w-[46px] items-center justify-center rounded-[999px] px-[13px] py-[6px] font-sans text-[12.5px] font-bold tracking-[0.08em] no-underline transition-[color,background] duration-150 ease-[ease] active:transform-[scale(0.94)]';

const STATE = {
  on: 'bg-[rgba(4,254,255,0.13)] text-(--accent-cyan) hover:text-(--accent-cyan)',
  off: 'text-(--ink-faint) hover:text-(--accent-cyan)',
};

interface LanguageSwitchProps {
  locale: Locale;
  className?: string;
}

/**
 * Locale lives in the URL, so each pill is a link to the same page in the other
 * locale rather than a button that mutates client state. Nothing here needs JS.
 *
 * The design marks the active pill with `aria-pressed`, which axe reports as a
 * critical `aria-allowed-attr` violation once these are links rather than
 * buttons. `Link` already puts `aria-current="page"` on whichever pill points
 * at the current URL, which is the state the design was reaching for.
 */
export const LanguageSwitch: FC<LanguageSwitchProps> = ({ locale, className }) => (
  <nav aria-label={SITE_COPY[locale].langAria} className={cn(GROUP, className)}>
    <Link to='/{-$locale}' params={{ locale: undefined }} hrefLang='ja' className={cn(PILL, locale === 'ja' ? STATE.on : STATE.off)}>
      JA
    </Link>
    <Link to='/{-$locale}' params={{ locale: 'en' }} hrefLang='en' className={cn(PILL, locale === 'en' ? STATE.on : STATE.off)}>
      EN
    </Link>
  </nav>
);
