import type { SkillItem } from './-/skill-group';

import { createFileRoute, rootRouteId, useRouteContext } from '@tanstack/react-router';

import { SKILLS_COPY } from '#i18n/copy';
import { localeHead } from '#i18n/head';

import { PageHeader } from '../-/ui/content/page-header';

import './-/skill-grid.css';
import { Card } from '../-/ui/surfaces/card';

import { SkillGroup } from './-/skill-group';

const LANGUAGES: readonly SkillItem[] = [
  { label: 'TypeScript', href: 'https://www.typescriptlang.org/' },
  { label: 'Rust', href: 'https://www.rust-lang.org/' },
  { label: 'Java', href: 'https://openjdk.org/' },
  { label: 'Kotlin', href: 'https://kotlinlang.org/' },
  { label: 'Swift', href: 'https://www.swift.org/' },
];

const FRONTEND: readonly SkillItem[] = [
  { label: 'React', href: 'https://react.dev/' },
  { label: 'TanStack Start / Router', href: 'https://tanstack.com/' },
  { label: 'Tailwind CSS', href: 'https://tailwindcss.com/' },
  { label: 'Vite', href: 'https://vite.dev/' },
  { label: 'Storybook', href: 'https://storybook.js.org/' },
];

const INFRA: readonly SkillItem[] = [
  { label: 'Cloudflare Workers', href: 'https://workers.cloudflare.com/' },
  { label: 'Workers KV / D1', href: 'https://developers.cloudflare.com/kv/' },
  { label: 'Docker', href: 'https://www.docker.com/' },
  { label: 'Kubernetes', href: 'https://kubernetes.io/' },
  { label: 'GitHub Actions', href: 'https://github.com/features/actions' },
];

/** The only group with six items rather than five. */
const TOOLCHAIN: readonly SkillItem[] = [
  { label: 'Vitest', href: 'https://vitest.dev/' },
  { label: 'Playwright', href: 'https://playwright.dev/' },
  { label: 'MSW', href: 'https://mswjs.io/' },
  { label: 'oxlint / oxfmt', href: 'https://oxc.rs/' },
  { label: 'pnpm', href: 'https://pnpm.io/' },
  { label: 'napi-rs', href: 'https://napi.rs/' },
];

const Skills = () => {
  const locale = useRouteContext({ from: rootRouteId, select: context => context.locale });
  const copy = SKILLS_COPY[locale];

  const often: readonly SkillItem[] = [
    { label: copy.chipWeb },
    { label: copy.chipCli },
    { label: copy.chipMc },
    { label: copy.chipBot },
    { label: copy.chipMac },
  ];

  return (
    <div className='relative mx-auto grid max-w-(--page-max) gap-[28px] px-[24px] pt-[48px] pb-[96px]'>
      <PageHeader kicker='SKILLS' title={copy.title} lede={copy.intro} className='animate-[fadeUp_0.6s_ease_backwards]' />

      <div className='ev-skill-grid grid grid-cols-[repeat(auto-fit,minmax(min(var(--card-min-skills),100%),1fr))] gap-[18px]'>
        <SkillGroup ink='ice' heading={copy.groupLang} items={LANGUAGES} className='animate-[fadeUp_0.6s_ease_0.08s_backwards]' />
        <SkillGroup ink='mint' heading={copy.groupFe} items={FRONTEND} className='ev-reveal' />
        <SkillGroup ink='sky' heading={copy.groupInfra} items={INFRA} className='ev-reveal' />
        <SkillGroup ink='violet' heading={copy.groupTest} items={TOOLCHAIN} className='ev-reveal' />
        <SkillGroup ink='rose' heading={copy.groupOften} items={often} className='ev-reveal' />
      </div>

      <Card variant='dashed' className='ev-reveal p-[20px_22px]'>
        <p className='text-(length:--text-body) leading-[1.8] text-(--ink-muted)'>{copy.note}</p>
      </Card>
    </div>
  );
};

export const Route = createFileRoute('/{-$locale}/skills/')({
  head: ({ match }) => localeHead(match.context.locale, '/skills'),
  component: Skills,
});
