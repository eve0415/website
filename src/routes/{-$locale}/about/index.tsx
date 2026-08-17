import { Link, createFileRoute, rootRouteId, useRouteContext } from '@tanstack/react-router';

import { ABOUT_COPY } from '#i18n/copy';
import { localeHead } from '#i18n/head';

import { CometNavLink, localeParams } from '../-/site/links';
import { PageHeader } from '../-/ui/content/page-header';
import { Card } from '../-/ui/surfaces/card';

import { LabCard } from './-/lab-card';

const About = () => {
  const locale = useRouteContext({ from: rootRouteId, select: context => context.locale });
  const copy = ABOUT_COPY[locale];

  return (
    <div className='relative mx-auto grid max-w-(--page-max-narrow) gap-[28px] px-[24px] pt-[48px] pb-[96px]'>
      <PageHeader kicker='ABOUT' title={copy.title} className='animate-[fadeUp_0.6s_ease_backwards]' />

      <div className='flex animate-[fadeUp_0.6s_ease_0.08s_backwards] flex-wrap items-start gap-[22px]'>
        <img
          src='/web-app-icon-192x192.png'
          alt={copy.altAvatar}
          width='112'
          height='112'
          className='size-[112px] flex-none animate-[floaty_6s_ease-in-out_infinite] rounded-[50%] border border-[rgba(160,150,255,.4)]'
        />
        <div className='grid flex-[1_1_320px] gap-[14px]'>
          <p className='text-[1rem] leading-[1.9] text-(--ink-body)'>{copy.p1}</p>
          <p className='text-[1rem] leading-[1.9] text-(--ink-body)'>{copy.p2}</p>
          <CometNavLink to='/{-$locale}/links' params={localeParams(locale)} className='justify-self-start'>
            {copy.seeContact}
          </CometNavLink>
        </div>
      </div>

      <Card variant='soft' className='ev-reveal grid gap-[10px] border-(--line-row) p-[20px_22px]'>
        <h2 className='text-[1rem] font-bold text-(--ink-ice)'>{copy.siteHead}</h2>
        <p className='text-(length:--text-nav) leading-[1.8] text-(--ink-muted)'>
          {copy.siteBefore}
          {/* The design distinguishes this inline link from the surrounding
              prose by colour alone, and #9fe8ff on #cfc9f2 is 1.16:1 — WCAG
              1.4.1 wants 3:1 for a colour-only cue, so it carries an underline
              too. Same trade the language switch makes with aria-current. */}
          <Link to='/{-$locale}/projects/website' params={localeParams(locale)} className='text-(--ink-ice) underline'>
            {copy.siteLink}
          </Link>
          {copy.siteAfter}
        </p>
      </Card>

      <LabCard locale={locale} />
    </div>
  );
};

export const Route = createFileRoute('/{-$locale}/about/')({
  head: ({ match }) => localeHead(match.context.locale, '/about'),
  component: About,
});
