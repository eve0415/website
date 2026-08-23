import type { ProjectLink } from './-/links-section';

import { createFileRoute, rootRouteId, useRouteContext } from '@tanstack/react-router';

import { PageHeader } from '#components/page-header';
import { Tag } from '#components/tag';
import { IFPATCHER_COPY, PROJECT_COPY } from '#i18n/copy';
import { localeHead } from '#i18n/head';

import { BackLink } from './-/back-link';
import { LinksSection } from './-/links-section';
import { NotePanel } from './-/panel';
import { StatCard } from './-/stat-card';

const TAGS = ['Java', 'Minecraft Forge', 'ASM'] as const;

const LINKS = [
  { label: 'GitHub', value: 'github.com/eve0415/IFPatcher ↗', href: 'https://github.com/eve0415/IFPatcher' },
  { label: 'CurseForge', value: 'curseforge.com/minecraft/mc-mods/ifpatcher ↗', href: 'https://www.curseforge.com/minecraft/mc-mods/ifpatcher' },
  { label: 'Modrinth', value: 'modrinth.com/mod/ifpatcher ↗', href: 'https://modrinth.com/mod/ifpatcher' },
] as const satisfies ProjectLink[];

const IfPatcher = () => {
  const locale = useRouteContext({ from: rootRouteId, select: context => context.locale });
  const copy = IFPATCHER_COPY[locale];

  return (
    <div className='relative mx-auto grid max-w-(--page-max-article) gap-6 px-6 pt-12 pb-24'>
      <BackLink locale={locale} />

      <PageHeader
        kicker='PROJECT'
        title='IFPatcher'
        lede={copy.lede}
        className='animate-[fadeUp_0.6s_ease_0.08s_backwards] gap-2.5'
        tags={TAGS.map(tag => (
          <Tag key={tag} hue='cyan' className='px-3 py-[3px]'>
            {tag}
          </Tag>
        ))}
      />

      <div className='ev-reveal grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5'>
        <StatCard hue='cyan' value='930,000+' label={copy.dlTotal} note='CurseForge 871,671 / Modrinth 58,219' />
        <StatCard hue='cyan' value='1.12.2' label={copy.version} />
        <StatCard hue='cyan' value='Tekkit 2' label={copy.tekkit} />
      </div>

      <NotePanel ink='ice' head={copy.fixHead} body={copy.fixBody} />

      <LinksSection ink='ice' heading={PROJECT_COPY[locale].linksHead} links={LINKS} />
    </div>
  );
};

export const Route = createFileRoute('/{-$locale}/projects/ifpatcher')({
  head: ({ match }) => localeHead(match.context.locale, '/projects/ifpatcher'),
  component: IfPatcher,
});
