import type { Project } from './-components/ProjectCard/project-card';
import type { FC } from 'react';

import { Link, createFileRoute } from '@tanstack/react-router';

import AnimatedCounter from './-components/AnimatedCounter/animated-counter';
import ProjectCard from './-components/ProjectCard/project-card';

const projects: Project[] = [
  {
    title: 'IFPatcher',
    description: 'Minecraft 1.12.2 向けの Industrial Foregoing パッチモッド。ASM レベルでのバグ修正を実装。',
    tags: ['Java', 'Minecraft Forge', 'ASM'],
    links: [
      { label: 'CurseForge', url: 'https://www.curseforge.com/minecraft/mc-mods/ifpatcher' },
      { label: 'Modrinth', url: 'https://modrinth.com/mod/ifpatcher' },
      { label: 'GitHub', url: 'https://github.com/eve0415/IFPatcher' },
    ],
    highlight: '795k+',
    highlightSub: 'Total Downloads',
    featured: true,
  },
  {
    title: 'eve0415.net',
    description: 'このウェブサイト自体がポートフォリオ。TanStack Start + Tailwind CSS 4 で構築。',
    tags: ['TypeScript', 'React', 'Cloudflare'],
    links: [{ label: 'ソースコード', url: 'https://github.com/eve0415/website' }],
  },
  {
    title: 'DevTool',
    description: '開発者向け Discord Bot。各種ユーティリティ機能を提供。',
    tags: ['TypeScript', 'Discord.js'],
    links: [{ label: 'GitHub', url: 'https://github.com/eve0415/DevTool' }],
  },
];

const ProjectsPage: FC = () => {
  return (
    <main className='min-h-dvh px-6 py-24 md:px-12'>
      {/* Header */}
      <header className='mb-16'>
        <Link to='/' className='group mb-8 inline-flex items-center gap-2 text-sm text-subtle-foreground transition-colors hover:text-neon'>
          <span className='transition-transform group-hover:-translate-x-1'>←</span>
          <span>Index</span>
        </Link>
        <h1 className='animate-fade-in-up font-bold text-4xl tracking-tight md:text-5xl'>Projects</h1>
        <p className='mt-4 text-muted-foreground'>実績とプロジェクト</p>
      </header>

      {/* Projects Grid */}
      <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
        {projects.map((project, index) => (
          <ProjectCard key={project.title} project={project} index={index} />
        ))}

        {/* More projects placeholder */}
        <article className='group flex items-center justify-center rounded-lg border border-line border-dashed bg-surface/50 p-6 transition-all duration-normal hover:border-neon/30'>
          <a
            href='https://github.com/eve0415?tab=repositories'
            target='_blank'
            rel='noopener noreferrer'
            className='text-center text-subtle-foreground transition-colors hover:text-neon'
          >
            <span className='block text-2xl transition-transform group-hover:scale-110'>+</span>
            <span className='mt-2 block text-sm'>その他のプロジェクト</span>
          </a>
        </article>
      </div>

      {/* GitHub Stats Section */}
      <section className='mt-24'>
        <h2 className='mb-8 font-bold text-2xl'>GitHub Activity</h2>
        <div className='grid gap-6 md:grid-cols-3'>
          <div className='group rounded-lg border border-line bg-surface p-6 transition-all duration-normal hover:border-neon/30'>
            <AnimatedCounter end={44} />
            <span className='mt-1 block text-sm text-subtle-foreground'>Public Repositories</span>
          </div>
          <div className='group rounded-lg border border-line bg-surface p-6 transition-all duration-normal hover:border-neon/30'>
            <AnimatedCounter end={29} />
            <span className='mt-1 block text-sm text-subtle-foreground'>Followers</span>
          </div>
          <div className='group rounded-lg border border-line bg-surface p-6 transition-all duration-normal hover:border-neon/30'>
            <span className='font-mono text-3xl text-cyan'>5+</span>
            <span className='mt-1 block text-sm text-subtle-foreground'>Languages</span>
          </div>
        </div>

        {/* Tech breakdown */}
        <div className='mt-8 rounded-lg border border-line bg-surface p-6'>
          <h3 className='mb-4 font-mono text-sm text-subtle-foreground uppercase tracking-wider'>// 主要言語</h3>
          <div className='flex flex-wrap gap-3'>
            {['TypeScript', 'JavaScript', 'Java', 'Kotlin', 'Rust', 'Go', 'Python'].map(lang => (
              <span
                key={lang}
                className='rounded-full bg-muted px-3 py-1 font-mono text-muted-foreground text-sm transition-colors hover:bg-neon/10 hover:text-neon'
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation hint */}
      <div className='mt-16 flex justify-center'>
        <div className='flex items-center gap-4 text-sm text-subtle-foreground'>
          <Link to='/skills' className='group flex items-center gap-2 transition-colors hover:text-neon'>
            <span>Skills Matrix</span>
            <span className='transition-transform group-hover:translate-x-1'>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
};

export const Route = createFileRoute('/projects/')({
  component: ProjectsPage,
});
