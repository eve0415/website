import { Outlet, createFileRoute, rootRouteId, useRouteContext } from '@tanstack/react-router';

import { SITE_COPY } from '#i18n/copy';
import { parseLocaleParam } from '#i18n/locale';

import { BrandLink } from './-/site/brand-link';
import { DwellTime } from './-/site/dwell-time';
import { TRAILING_CLASS } from './-/site/header-classes';
import { LanguageSwitch } from './-/site/language-switch';
import { navItems } from './-/site/nav';
import { SiteFooter } from './-/site/site-footer';
import { SiteHeader } from './-/site/site-header';
import { ScrollEndStar } from './-/sky/scroll-end-star';
import { ShootingStar } from './-/sky/shooting-star';
import { StarField } from './-/sky/star-field';

/** Any constant; it only has to make the two fields differ from each other. */
const ROOT_STAR_SEED = 20_220_415;

const LocaleLayout = () => {
  const locale = useRouteContext({ from: rootRouteId, select: context => context.locale });

  return (
    <div className='relative flex min-h-[calc(100svh/var(--z,1))] flex-col' style={{ background: 'var(--sky-root)' }}>
      <div aria-hidden='true' className='pointer-events-none absolute inset-0 overflow-hidden' style={{ background: 'var(--sky-nebula)' }}>
        <div className='absolute inset-0' style={{ opacity: 'var(--sky-star-alpha)' }}>
          <StarField count={36} seed={ROOT_STAR_SEED} />
          <ShootingStar arc='steep' tail={110} duration={13.5} delay={2.5} className='top-[14%] right-[10%]' />
          <ShootingStar arc='long' tail={200} duration={23} delay={13} className='top-[52%] right-[-4%]' />
        </div>
      </div>

      <ScrollEndStar />

      <SiteHeader
        navLabel={SITE_COPY[locale].navAria}
        skipLabel={SITE_COPY[locale].skipToContent}
        brandElement={<BrandLink locale={locale} />}
        items={navItems(locale)}
      >
        <LanguageSwitch locale={locale} className={TRAILING_CLASS} />
      </SiteHeader>

      {/* `#main` is the header's bypass-link target. `tabIndex={-1}` is what
          moves a screen reader's virtual cursor with the skip link: Chromium
          moves the sequential-focus start point on its own, VoiceOver does not. */}
      <main id='main' tabIndex={-1} className='ev-on-sky flex-1'>
        <Outlet />
      </main>

      <SiteFooter>
        <DwellTime locale={locale} />
      </SiteFooter>
    </div>
  );
};

export const Route = createFileRoute('/{-$locale}')({
  // Returning false means "this route does not match", so an unknown first
  // segment falls through to a 404 instead of being swallowed by `{-$locale}`
  // and rendering the home page. The resolved locale comes from root context.
  params: {
    parse: params => (parseLocaleParam(params.locale) === undefined ? false : params),
  },
  component: LocaleLayout,
});
