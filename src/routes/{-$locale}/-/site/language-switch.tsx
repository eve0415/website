import type { Locale } from '#i18n/locale';
import type { FC } from 'react';

import { Link } from '@tanstack/react-router';

import { SITE_COPY } from '#i18n/copy';

import { cn } from '../cn';

/**
 * `min-h` is the header row's own token: this group is the tallest thing on the
 * row, so `--header-h` — and the `scroll-padding-top` derived from it — is only
 * right for as long as the two agree.
 */
const GROUP = 'inline-flex min-h-(--header-row) items-center rounded-[999px] border border-(--line-header) p-[2px]';

const PILL =
  'inline-flex min-h-[40px] min-w-[46px] items-center justify-center rounded-[999px] px-[13px] py-[6px] font-sans text-[0.78125rem] font-bold tracking-[0.08em] no-underline transition-[color,background] duration-150 ease-[ease] active:transform-[scale(0.94)]';

const STATE = {
  on: 'bg-[rgba(4,254,255,0.13)] text-(--accent-cyan) hover:text-(--accent-cyan)',
  off: 'text-(--ink-faint) hover:text-(--accent-cyan)',
};

interface LanguageSwitchProps {
  locale: Locale;
  className?: string;
}

/**
 * Locale lives in the URL, so each pill is a link to *this same page* in the
 * other locale rather than a button that mutates client state. Nothing here
 * needs JS.
 *
 * `to='.'` is the router's own name for the current route: with no `from` it
 * resolves against the matched leaf's `fullPath` *template* — `/{-$locale}/
 * projects/cella`, not the interpolated pathname — and then re-interpolates it
 * with the params below. That is what keeps the switch on the page you are on;
 * a literal `to='/{-$locale}'` sent every visitor home instead.
 *
 * `locale: undefined` has to be written out: `params` is merged onto the
 * current params, so `{}` would leave `en` in place and the Japanese pill would
 * point at the English page.
 *
 * The design marks the active pill with `aria-pressed`, which axe reports as a
 * critical `aria-allowed-attr` violation once these are links rather than
 * buttons. `Link` already puts `aria-current="page"` on whichever pill points
 * at the current URL, which is the state the design was reaching for.
 *
 * `exact` matching is what makes that state honest. On a 404 the matched leaf
 * is the `{-$locale}` layout, so `to='.'` collapses to `/` or `/en` — and under
 * the default prefix matching the `/en` pill would claim `aria-current="page"`
 * on `/en/nope`, announcing a link to the home page as the page you are on. The
 * twenty real pages are unaffected: each pill's href already is the current URL.
 * The pills still colour by locale, which is the language you are reading, not
 * the page you are on.
 */
export const LanguageSwitch: FC<LanguageSwitchProps> = ({ locale, className }) => (
  <nav aria-label={SITE_COPY[locale].langAria} className={cn(GROUP, className)}>
    <Link to='.' params={{ locale: undefined }} activeOptions={{ exact: true }} hrefLang='ja' className={cn(PILL, locale === 'ja' ? STATE.on : STATE.off)}>
      JA
    </Link>
    <Link to='.' params={{ locale: 'en' }} activeOptions={{ exact: true }} hrefLang='en' className={cn(PILL, locale === 'en' ? STATE.on : STATE.off)}>
      EN
    </Link>
  </nav>
);
