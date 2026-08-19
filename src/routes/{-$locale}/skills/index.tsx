import type { SkillItem } from './-/skill-chips';

import { createFileRoute, rootRouteId, useRouteContext } from '@tanstack/react-router';

import { Card } from '#components/card';
import { PageHeader } from '#components/page-header';
import { SKILLS_COPY } from '#i18n/copy';

import './-/skill-grid.css';
import { localeHead } from '#i18n/head';

import { AiCard } from './-/ai-card';
import { DAILY_LEGEND_ID } from './-/skill-chips';
import { SkillGroup } from './-/skill-group';

const LANGUAGES = [
  { label: 'TypeScript', href: 'https://www.typescriptlang.org/', daily: true },
  { label: 'Rust', href: 'https://www.rust-lang.org/', daily: true },
  { label: 'Java', href: 'https://openjdk.org/' },
  { label: 'Kotlin', href: 'https://kotlinlang.org/' },
  { label: 'Swift', href: 'https://www.swift.org/' },
] as const satisfies SkillItem[];

const FRONTEND = [
  { label: 'React', href: 'https://react.dev/', daily: true },
  { label: 'React Compiler', href: 'https://react.dev/learn/react-compiler' },
  { label: 'TanStack Start / Router', href: 'https://tanstack.com/' },
  { label: 'TanStack Query / Form', href: 'https://tanstack.com/query/latest' },
  { label: 'Tailwind CSS', href: 'https://tailwindcss.com/' },
  { label: 'shadcn/ui', href: 'https://ui.shadcn.com/' },
  { label: 'zod', href: 'https://zod.dev/' },
  { label: 'valibot', href: 'https://valibot.dev/' },
  { label: 'Vite', href: 'https://vite.dev/' },
  { label: 'Storybook', href: 'https://storybook.js.org/' },
] as const satisfies SkillItem[];

const BACKEND = [
  { label: 'Node.js', href: 'https://nodejs.org/' },
  { label: 'Cloudflare Workers', href: 'https://workers.cloudflare.com/', daily: true },
  { label: 'SQLite (D1)', href: 'https://developers.cloudflare.com/d1/' },
  { label: 'drizzle ORM', href: 'https://orm.drizzle.team/' },
  { label: 'PostgreSQL', href: 'https://www.postgresql.org/' },
  { label: 'Minecraft Forge', href: 'https://files.minecraftforge.net/' },
  { label: 'Paper', href: 'https://papermc.io/' },
] as const satisfies SkillItem[];

const INFRA = [
  { label: 'Docker', href: 'https://www.docker.com/', daily: true },
  { label: 'Kubernetes', href: 'https://kubernetes.io/' },
  { label: 'GitHub Actions', href: 'https://github.com/features/actions' },
  { label: 'OpenTelemetry', href: 'https://opentelemetry.io/' },
  { label: 'Linux', href: 'https://www.kernel.org/' },
  { label: 'macOS', href: 'https://www.apple.com/macos/' },
] as const satisfies SkillItem[];

const Skills = () => {
  const locale = useRouteContext({ from: rootRouteId, select: context => context.locale });
  const copy = SKILLS_COPY[locale];

  const toolchain = [
    { label: 'Vitest', href: 'https://vitest.dev/' },
    { label: 'Playwright', href: 'https://playwright.dev/' },
    { label: 'MSW', href: 'https://mswjs.io/' },
    { label: 'oxlint / oxfmt', href: 'https://oxc.rs/' },
    { label: 'pnpm', href: 'https://pnpm.io/' },
    { label: 'napi-rs', href: 'https://napi.rs/' },
    { label: 'Git', href: 'https://git-scm.com/' },
    { label: 'devcontainer', href: 'https://containers.dev/' },
    { label: 'OrbStack', href: 'https://orbstack.dev/' },
    { label: copy.chipBrew, href: 'https://brew.sh/' },
  ] as const satisfies SkillItem[];

  return (
    <div className='relative mx-auto grid max-w-(--page-max) gap-7 px-6 pt-12 pb-24'>
      <div className='grid animate-[fadeUp_0.6s_ease_backwards] gap-2 font-sans'>
        <PageHeader kicker='SKILLS' title={copy.title} lede={copy.intro} />
        <p id={DAILY_LEGEND_ID} className='text-(length:--text-caption) text-(--ink-faint)'>
          {copy.legend}
        </p>
      </div>

      <div className='ev-skill-grid grid grid-cols-[repeat(auto-fit,minmax(min(var(--card-min-skills),100%),1fr))] gap-4.5'>
        <AiCard locale={locale} />
        <SkillGroup ink='ice' heading={copy.groupLang} items={LANGUAGES} className='ev-reveal' />
        <SkillGroup ink='mint' heading={copy.groupFe} items={FRONTEND} className='ev-reveal' />
        <SkillGroup ink='sky' heading={copy.groupBe} items={BACKEND} className='ev-reveal' />
        <SkillGroup ink='violet' heading={copy.groupInfra} items={INFRA} className='ev-reveal' />
        <SkillGroup ink='rose' heading={copy.groupTest} items={toolchain} className='ev-reveal' />
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
