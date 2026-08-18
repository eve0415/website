import { Outlet, createFileRoute, rootRouteId, useRouteContext, useRouterState } from '@tanstack/react-router';

import { SITE_COPY } from '#i18n/copy';
import { parseLocaleParam } from '#i18n/locale';

import { BrandLink } from './-/site/brand-link';
import { DwellTime } from './-/site/dwell-time';
import { LanguageSwitch } from './-/site/language-switch';
import { activeNavKey, navItems } from './-/site/nav';
import { SiteFooter } from './-/site/site-footer';
import { SiteHeader } from './-/site/site-header';
import { skyCss } from './-/sky/palette';
import { ShootingStar } from './-/sky/shooting-star';
import { StarField } from './-/sky/star-field';

/**
 * Midnight — the design's canonical sky and the one `__root.css` ships tokens
 * for. Deriving it from the clock would differ between the prerender and the
 * browser and blow up hydration, so it is a constant.
 */
const SKY = skyCss(0);

/** Any constant; it only has to make the two fields differ from each other. */
const ROOT_STAR_SEED = 20_220_415;

const LocaleLayout = () => {
  const locale = useRouteContext({ from: rootRouteId, select: context => context.locale });
  const pathname = useRouterState({ select: state => state.location.pathname });

  return (
    <div className='relative flex min-h-[calc(100svh/var(--z,1))] flex-col' style={{ background: SKY.rootBg }}>
      <div aria-hidden='true' className='pointer-events-none absolute inset-0 overflow-hidden' style={{ background: SKY.nebulaBg }}>
        <div className='absolute inset-0' style={{ opacity: SKY.starAlpha }}>
          <StarField count={36} seed={ROOT_STAR_SEED} />
          <ShootingStar arc='steep' tail={110} duration={13.5} delay={2.5} className='top-[14%] right-[10%]' />
          <ShootingStar arc='long' tail={200} duration={23} delay={13} className='top-[52%] right-[-4%]' />
        </div>
      </div>

      <SiteHeader
        navLabel={SITE_COPY[locale].navAria}
        brandElement={<BrandLink locale={locale} />}
        items={navItems(locale)}
        active={activeNavKey(locale, pathname)}
      >
        <LanguageSwitch locale={locale} />
      </SiteHeader>

      <main className='flex-1'>
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
