import type { ProjectLink } from './-/links-section';

import { createFileRoute, rootRouteId, useRouteContext } from '@tanstack/react-router';

import { DOTCLAUDE_COPY, PROJECT_COPY } from '#i18n/copy';
import { localeHead } from '#i18n/head';

import { PageHeader } from '../-ui/content/page-header';
import { Tag } from '../-ui/surfaces/tag';

import { BackLink } from './-/back-link';
import { LinksSection } from './-/links-section';
import { NotePanel } from './-/panel';

const TAGS = ['TypeScript', 'Cloudflare Workers'];

const Dotclaude = () => {
  const locale = useRouteContext({ from: rootRouteId, select: context => context.locale });
  const copy = DOTCLAUDE_COPY[locale];
  const chrome = PROJECT_COPY[locale];

  const links: readonly ProjectLink[] = [
    { label: copy.try, value: 'dotclaude.eve0415.workers.dev ↗', href: 'https://dotclaude.eve0415.workers.dev/' },
    { label: 'GitHub', value: 'github.com/eve0415/dotclaude ↗', href: 'https://github.com/eve0415/dotclaude' },
  ];

  return (
    <div className='relative mx-auto grid max-w-[860px] gap-[24px] px-[24px] pt-[48px] pb-[96px]'>
      <BackLink locale={locale} />

      <PageHeader
        kicker='PROJECT'
        title='dotclaude'
        lede={copy.lede}
        className='animate-[fadeUp_0.6s_ease_0.08s_backwards] gap-[10px]'
        tags={TAGS.map(tag => (
          <Tag key={tag} hue='violet' className='px-[12px] py-[3px]'>
            {tag}
          </Tag>
        ))}
      />

      <NotePanel dashed ink='violet' head={copy.privHead} body={copy.privBody} />

      <LinksSection ink='violet' heading={chrome.linksHead} links={links} />
    </div>
  );
};

export const Route = createFileRoute('/{-$locale}/projects/dotclaude')({
  head: ({ match }) => localeHead(match.context.locale, '/projects/dotclaude'),
  component: Dotclaude,
});
