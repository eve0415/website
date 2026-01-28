import type { Project } from './-components/ProjectCard/project-card';
import type { FC } from 'react';

import { Link, createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import AnimatedCounter from './-components/AnimatedCounter/animated-counter';
import ProjectCard from './-components/ProjectCard/project-card';

// Shared IntersectionObserver for all counters in this section
const useCounterVisibility = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting === true) {
          setIsVisible(true);
          // Once visible, we don't need to observe anymore
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(section);
    return () => {
      observer.disconnect();
    };
  }, []);

  return { sectionRef, isVisible };
};

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
  const { sectionRef, isVisible } = useCounterVisibility();

  return (
    <main className='min-h-dvh px-6 py-24 md:px-12'>
      {/* Header */}
      <header className='mb-16'>
        <Link to='/' className='group text-subtle-foreground hover:text-neon mb-8 inline-flex items-center gap-2 text-sm transition-colors'>
          <span className='transition-transform group-hover:-translate-x-1'>←</span>
          <span>Index</span>
        </Link>
        <h1 className='animate-fade-in-up text-4xl font-bold tracking-tight md:text-5xl'>Projects</h1>
        <p className='text-muted-foreground mt-4'>実績とプロジェクト</p>
      </header>

      {/* Projects Grid */}
      <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
        {projects.map((project, index) => (
          <ProjectCard key={project.title} project={project} index={index} />
        ))}

        {/* More projects placeholder */}
        <article className='group border-line bg-surface/50 duration-normal hover:border-neon/30 flex items-center justify-center rounded-lg border border-dashed p-6 transition-all'>
          <a
            href='https://github.com/eve0415?tab=repositories'
            target='_blank'
            rel='noopener noreferrer'
            className='text-subtle-foreground hover:text-neon text-center transition-colors'
          >
            <span className='block text-2xl transition-transform group-hover:scale-110'>+</span>
            <span className='mt-2 block text-sm'>その他のプロジェクト</span>
          </a>
        </article>
      </div>

      {/* GitHub Stats Section */}
      <section ref={sectionRef} className='mt-24'>
        <h2 className='mb-8 text-2xl font-bold'>GitHub Activity</h2>
        <div className='grid gap-6 md:grid-cols-3'>
          <div className='group border-line bg-surface duration-normal hover:border-neon/30 rounded-lg border p-6 transition-all'>
            <AnimatedCounter end={44} isVisible={isVisible} />
            <span className='text-subtle-foreground mt-1 block text-sm'>Public Repositories</span>
          </div>
          <div className='group border-line bg-surface duration-normal hover:border-neon/30 rounded-lg border p-6 transition-all'>
            <AnimatedCounter end={29} isVisible={isVisible} />
            <span className='text-subtle-foreground mt-1 block text-sm'>Followers</span>
          </div>
          <div className='group border-line bg-surface duration-normal hover:border-neon/30 rounded-lg border p-6 transition-all'>
            <span className='text-cyan font-mono text-3xl'>5+</span>
            <span className='text-subtle-foreground mt-1 block text-sm'>Languages</span>
          </div>
        </div>

        {/* Tech breakdown */}
        <div className='border-line bg-surface mt-8 rounded-lg border p-6'>
          {/* oxlint-disable-next-line eslint-plugin-react(jsx-no-comment-textnodes) -- Decorative code comment style */}
          <h3 className='text-subtle-foreground mb-4 font-mono text-sm tracking-wider uppercase'>// 主要言語</h3>
          <div className='flex flex-wrap gap-3'>
            {['TypeScript', 'JavaScript', 'Java', 'Kotlin', 'Rust', 'Go', 'Python'].map(lang => (
              <span
                key={lang}
                className='bg-muted text-muted-foreground hover:bg-neon/10 hover:text-neon rounded-full px-3 py-1 font-mono text-sm transition-colors'
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation hint */}
      <div className='mt-16 flex justify-center'>
        <div className='text-subtle-foreground flex items-center gap-4 text-sm'>
          <Link to='/skills' className='group hover:text-neon flex items-center gap-2 transition-colors'>
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
