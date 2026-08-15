import type { Locale } from '#i18n/locale';
import type { ProjectLink } from '../-projects/links-section';

import { createFileRoute, rootRouteId, useRouteContext } from '@tanstack/react-router';
import { Fragment } from 'react';

import { HISTORY_COPY, PROJECT_COPY } from '#i18n/copy';
import { localeHead } from '#i18n/head';

import { BackLink } from '../-projects/back-link';
import { LinksSection } from '../-projects/links-section';
import '../-projects/reveal.css';
import { cn } from '../-ui/cn';
import { PageHeader } from '../-ui/content/page-header';
import { Card } from '../-ui/surfaces/card';
import { Chip } from '../-ui/surfaces/chip';

const DOT = 'mt-[5px] size-[12px] flex-none rounded-[50%] bg-[linear-gradient(135deg,#04feff,#00dda8)] shadow-[0_0_12px_2px_rgba(4,254,255,.55)]';

const RAIL = 'w-[2px] flex-1 rounded-[1px] bg-[linear-gradient(180deg,rgba(4,254,255,.45),rgba(160,150,255,.15))]';

const CHIP = 'px-[12px] py-[3px] text-(length:--text-tag)';

interface Generation {
  date: string;
  title: (copy: (typeof HISTORY_COPY)[Locale]) => string;
  stack: (copy: (typeof HISTORY_COPY)[Locale]) => readonly string[];
  body: (copy: (typeof HISTORY_COPY)[Locale]) => string;
}

/** v1's heading is the same in both locales, so it is not in the copy module. */
const GENERATIONS: readonly Generation[] = [
  {
    date: '2022.04',
    title: () => 'v1 — Next.js + MUI',
    stack: () => ['Next.js 12', 'MUI', 'Cloudflare Workers + R2'],
    body: copy => copy.v1Body,
  },
  {
    date: '2022.12',
    title: copy => copy.v2Title,
    stack: () => ['Next.js', 'Mantine'],
    body: copy => copy.v2Body,
  },
  {
    date: '2023.07',
    title: copy => copy.v3Title,
    stack: () => ['Next.js', 'Panda CSS', 'million.js', 'Cloudflare Pages'],
    body: copy => copy.v3Body,
  },
  {
    date: '2026.01',
    title: copy => copy.v4Title,
    stack: () => ['TanStack Start', 'React 19', 'Tailwind CSS 4', 'Cloudflare Workers'],
    body: copy => copy.v4Body,
  },
  {
    date: '2026',
    title: copy => copy.v5Title,
    stack: copy => ['Claude Design', copy.tagDS, 'Noto Sans JP', 'prefers-reduced-motion'],
    body: copy => copy.v5Body,
  },
];

const WebsiteHistory = () => {
  const locale = useRouteContext({ from: rootRouteId, select: context => context.locale });
  const copy = HISTORY_COPY[locale];
  const chrome = PROJECT_COPY[locale];

  const links: readonly ProjectLink[] = [
    { label: 'GitHub', value: 'github.com/eve0415/website ↗', href: 'https://github.com/eve0415/website' },
    { label: copy.prodSite, value: 'eve0415.net ↗', href: 'https://eve0415.net' },
  ];

  return (
    <div className='relative mx-auto grid max-w-[860px] gap-[24px] px-[24px] pt-[48px] pb-[96px]'>
      <BackLink locale={locale} />

      <PageHeader kicker='HISTORY' title={copy.title} lede={copy.intro} className='animate-[fadeUp_0.6s_ease_0.08s_backwards] gap-[10px]' />

      <Card variant='soft' className='ev-reveal rounded-(--radius-card-lg) p-[26px_26px_6px]'>
        <div className='grid grid-cols-[16px_1fr] gap-[18px]'>
          {GENERATIONS.map((generation, index) => {
            const last = index === GENERATIONS.length - 1;
            return (
              <Fragment key={generation.date}>
                <div className={cn('flex flex-col items-center', last ? undefined : 'gap-[6px]')}>
                  <span className={DOT} />
                  {last ? null : <span className={RAIL} />}
                </div>
                <div className={cn('grid gap-[10px]', last ? 'pb-[26px]' : 'pb-[30px]')}>
                  <p className='text-[13px] tracking-(--tracking-hero-kicker) text-(--ink-ice)'>{generation.date}</p>
                  <h2 className='text-[20px] font-bold text-(--ink-title)'>{generation.title(copy)}</h2>
                  <div className='ev-stg flex flex-wrap gap-[8px]'>
                    {generation.stack(copy).map((item, itemIndex) => (
                      <Chip key={item} className={cn(CHIP, last && itemIndex === 0 && 'border-(--line-accent) text-(--ink-ice)')}>
                        {item}
                      </Chip>
                    ))}
                  </div>
                  <p className='text-(length:--text-body) leading-[1.85] text-(--ink-muted)'>{generation.body(copy)}</p>
                </div>
              </Fragment>
            );
          })}
        </div>
      </Card>

      <LinksSection ink='rose' heading={chrome.linksHead} links={links} />
    </div>
  );
};

export const Route = createFileRoute('/{-$locale}/projects/website')({
  head: ({ match }) => localeHead(match.context.locale, '/projects/website'),
  component: WebsiteHistory,
});
