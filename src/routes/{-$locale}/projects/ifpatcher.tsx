import type { ProjectLink } from '../-projects/links-section';

import { createFileRoute, rootRouteId, useRouteContext } from '@tanstack/react-router';

import { IFPATCHER_COPY, PROJECT_COPY } from '#i18n/copy';
import { localeHead } from '#i18n/head';

import { BackLink } from '../-projects/back-link';
import { LinksSection } from '../-projects/links-section';
import { NotePanel } from '../-projects/panel';
import { StatCard } from '../-projects/stat-card';
import { PageHeader } from '../-ui/content/page-header';
import { Tag } from '../-ui/surfaces/tag';

const TAGS = ['Java', 'Minecraft Forge', 'ASM'];

const LINKS: readonly ProjectLink[] = [
  { label: 'GitHub', value: 'github.com/eve0415/IFPatcher ↗', href: 'https://github.com/eve0415/IFPatcher' },
  { label: 'CurseForge', value: 'curseforge.com/minecraft/mc-mods/ifpatcher ↗', href: 'https://www.curseforge.com/minecraft/mc-mods/ifpatcher' },
  { label: 'Modrinth', value: 'modrinth.com/mod/ifpatcher ↗', href: 'https://modrinth.com/mod/ifpatcher' },
];

const IfPatcher = () => {
  const locale = useRouteContext({ from: rootRouteId, select: context => context.locale });
  const copy = IFPATCHER_COPY[locale];

  return (
    <div className='relative mx-auto grid max-w-[860px] gap-[24px] px-[24px] pt-[48px] pb-[96px]'>
      <BackLink locale={locale} />

      <PageHeader
        kicker='PROJECT'
        title='IFPatcher'
        lede={copy.lede}
        className='animate-[fadeUp_0.6s_ease_0.08s_backwards] gap-[10px]'
        tags={TAGS.map(tag => (
          <Tag key={tag} hue='cyan' className='px-[12px] py-[3px]'>
            {tag}
          </Tag>
        ))}
      />

      <div className='ev-reveal grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[14px]'>
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
