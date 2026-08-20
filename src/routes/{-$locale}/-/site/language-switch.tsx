import type { Locale } from '#i18n/locale';
import type { FC } from 'react';

import { Link } from '@tanstack/react-router';

import './language-switch.css';
import { SITE_COPY } from '#i18n/copy';
import { cn } from '#lib/cn';
import { tw } from '#lib/tw';

/**
 * `min-h` is the header row's own token: this group is the tallest thing on the
 * row, so `--header-h` — and the `scroll-padding-top` derived from it — is only
 * right for as long as the two agree.
 */
const GROUP = tw('inline-flex min-h-(--header-row) items-center rounded-[999px] border border-(--line-header) p-0.5');

const PILL = tw(
  'relative inline-flex min-h-10 min-w-11.5 items-center justify-center rounded-[999px] px-[13px] py-1.5 font-sans text-[0.78125rem] font-bold tracking-[0.08em] no-underline transition-[color,background] duration-150 ease-[ease] active:transform-[scale(0.94)]',
);

/**
 * The sparkle the comp pops on the language you have just chosen. It is a
 * mount, not a state machine: only the active pill carries one, so switching
 * mounts a fresh span on the other pill and the animation runs off that. The
 * door wipe releases the navigation at the moment its halves meet, so the pill
 * changes hands behind them and the sparkle is revealed as they part.
 *
 * On the first load of a document it plays too, under an opening curtain that
 * has another two seconds to run — and for a reader who asked for less motion
 * the blanket rule in `__root.css` collapses it to nothing.
 */
const Kira: FC = () => (
  <span
    aria-hidden='true'
    className='absolute top-[-4px] right-[-4px] size-[11px] transform-[scale(0)] animate-[evLangKira_.55s_ease-in-out_.12s_both] bg-(--star-white) drop-shadow-[0_0_5px_rgba(4,254,255,.9)] [clip-path:polygon(50%_0%,61%_39%,100%_50%,61%_61%,50%_100%,39%_61%,0%_50%,39%_39%)]'
  />
);

const STATE = {
  on: tw('bg-[color-mix(in_srgb,var(--accent)_13%,transparent)] text-(--accent)'),
  off: tw('text-(--ink-faint) hover:text-(--accent)'),
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
 *
 * The visible "JA"/"EN" is hidden from assistive tech and the accessible name
 * is the language's own endonym, carrying a matching `lang` so it is voiced
 * with that language's phonetics rather than the page's. `hrefLang` describes
 * the destination and does not affect pronunciation. The endonyms are literals
 * rather than `SITE_COPY` entries on purpose: a language names itself the same
 * way whichever page you are reading, so translating them would be the bug.
 */
export const LanguageSwitch: FC<LanguageSwitchProps> = ({ locale, className }) => (
  <nav aria-label={SITE_COPY[locale].langAria} className={cn(GROUP, className)}>
    <Link to='.' params={{ locale: undefined }} activeOptions={{ exact: true }} hrefLang='ja' className={cn(PILL, locale === 'ja' ? STATE.on : STATE.off)}>
      <span aria-hidden='true'>JA</span>
      <span className='sr-only' lang='ja'>
        日本語
      </span>
      {locale === 'ja' ? <Kira /> : null}
    </Link>
    <Link to='.' params={{ locale: 'en' }} activeOptions={{ exact: true }} hrefLang='en' className={cn(PILL, locale === 'en' ? STATE.on : STATE.off)}>
      <span aria-hidden='true'>EN</span>
      <span className='sr-only' lang='en'>
        English
      </span>
      {locale === 'en' ? <Kira /> : null}
    </Link>
  </nav>
);
