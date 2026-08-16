import type { CommandSegment } from './-/command-box';
import type { ProjectLink } from './-/links-section';

import { createFileRoute, rootRouteId, useRouteContext } from '@tanstack/react-router';

import { CELLA_COPY, PROJECT_COPY } from '#i18n/copy';
import { localeHead } from '#i18n/head';

import { PageHeader } from '../-ui/content/page-header';
import { Tag } from '../-ui/surfaces/tag';

import { BackLink } from './-/back-link';
import { CommandBox } from './-/command-box';
import { LinksSection } from './-/links-section';
import { NotePanel } from './-/panel';
import { StatCard } from './-/stat-card';

const TAGS = ['Rust', 'CLI'];

const BREW = 'brew install eve0415/tap/cella';

const BREW_SEGMENTS: readonly CommandSegment[] = [
  { key: 'cmd', text: 'brew', color: 'text-(--accent-cyan)' },
  { key: 'verb', text: ' install', color: 'text-(--ink-ice)' },
  { key: 'pkg', text: ' eve0415/tap/cella', color: 'text-(--ink-title)' },
];

const Cella = () => {
  const locale = useRouteContext({ from: rootRouteId, select: context => context.locale });
  const copy = CELLA_COPY[locale];
  const chrome = PROJECT_COPY[locale];

  const links: readonly ProjectLink[] = [
    { label: 'GitHub', value: 'github.com/eve0415/cella ↗', href: 'https://github.com/eve0415/cella' },
    { label: copy.releases, value: copy.relBins, href: 'https://github.com/eve0415/cella/releases' },
  ];

  return (
    <div className='relative mx-auto grid max-w-[860px] gap-[24px] px-[24px] pt-[48px] pb-[96px]'>
      <BackLink locale={locale} />

      <PageHeader
        kicker='PROJECT'
        title='cella'
        lede={copy.lede}
        className='animate-[fadeUp_0.6s_ease_0.08s_backwards] gap-[10px]'
        tags={TAGS.map(tag => (
          <Tag key={tag} hue='mint' className='px-[12px] py-[3px]'>
            {tag}
          </Tag>
        ))}
      />

      <div className='ev-reveal grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[14px]'>
        <StatCard hue='mint' value='alpha' label={copy.status} />
        <StatCard hue='mint' value='25' label={copy.crates} />
      </div>

      <CommandBox
        title={copy.brewTitle}
        segments={BREW_SEGMENTS}
        command={BREW}
        copiedText={chrome.copied}
        copyLabel={chrome.btnCopy}
        copiedLabel={chrome.btnCopied}
        caretClassName='text-(--accent-mint)'
      />

      <NotePanel ink='mint' head={copy.canHead} body={copy.canBody} />

      <LinksSection ink='mint' heading={chrome.linksHead} links={links} />
    </div>
  );
};

export const Route = createFileRoute('/{-$locale}/projects/cella')({
  head: ({ match }) => localeHead(match.context.locale, '/projects/cella'),
  component: Cella,
});
