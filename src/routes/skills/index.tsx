import type { Skill } from './-config/skills-config';
import type { FC } from 'react';

import { Link, createFileRoute } from '@tanstack/react-router';

import SkillCard from './-components/SkillCard/SkillCard';
import SkillsVisualization from './-components/SkillsVisualization/SkillsVisualization';
import { categoryIcons, categoryLabels, levelConfig, skills } from './-config/skills-config';

const SkillsPage: FC = () => {
  const groupedSkills = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const category = skill.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  return (
    <main className='min-h-dvh px-6 py-24 md:px-12'>
      {/* Header */}
      <header className='mb-16'>
        <Link to='/' className='group mb-8 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent-primary'>
          <span className='transition-transform group-hover:-translate-x-1'>←</span>
          <span>Index</span>
        </Link>
        <h1 className='animate-fade-in-up font-bold text-4xl tracking-tight md:text-5xl'>Skills Matrix</h1>
        <p className='mt-4 text-text-secondary'>技術スタック</p>
      </header>

      {/* Legend */}
      <div className='mb-12 flex flex-wrap gap-6'>
        {Object.entries(levelConfig).map(([level, config]) => {
          const colors: Record<string, string> = {
            'accent-primary': 'bg-accent-primary',
            'accent-secondary': 'bg-accent-secondary',
            'accent-tertiary': 'bg-accent-tertiary',
          };
          return (
            <div key={level} className='flex items-center gap-2'>
              <span className={`size-3 rounded-full ${colors[config.color]}`} />
              <span className='text-sm text-text-muted'>{config.label}</span>
              <span className='font-mono text-text-muted text-xs opacity-50'>({config.progress}%)</span>
            </div>
          );
        })}
      </div>

      {/* Skills Visualization */}
      <section className='mb-16'>
        <SkillsVisualization />
      </section>

      {/* Skills Grid by Category */}
      <div className='grid gap-12 lg:grid-cols-3'>
        {(Object.keys(groupedSkills) as Array<keyof typeof categoryLabels>).map(category => (
          <section key={category}>
            <h2 className='mb-6 flex items-center gap-2 border-border-subtle border-b pb-2 font-mono text-sm text-text-muted uppercase tracking-wider'>
              <span>{categoryIcons[category]}</span>
              <span>{categoryLabels[category]}</span>
            </h2>
            <div className='space-y-3'>
              {groupedSkills[category]?.map((skill, index) => (
                <SkillCard key={skill.name} skill={skill} index={index} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Learning Journey */}
      <section className='mt-24'>
        <h2 className='mb-8 font-bold text-2xl'>現在学習中</h2>
        <div className='grid gap-4 md:grid-cols-2'>
          <div className='group rounded-lg border border-border-subtle bg-bg-secondary p-6 transition-all duration-normal hover:border-accent-tertiary/30'>
            <h3 className='font-bold text-accent-tertiary text-lg'>Rust</h3>
            <p className='mt-2 text-sm text-text-secondary'>
              システムプログラミングとパフォーマンス最適化のため学習中。 メモリ安全性と並行処理の理解を深めている。
            </p>
            <div className='mt-4 h-1 w-full rounded-full bg-bg-tertiary'>
              <div className='h-full rounded-full bg-accent-tertiary transition-all duration-slow' style={{ width: '35%' }} />
            </div>
          </div>
          <div className='group rounded-lg border border-border-subtle bg-bg-secondary p-6 transition-all duration-normal hover:border-accent-tertiary/30'>
            <h3 className='font-bold text-accent-tertiary text-lg'>Go</h3>
            <p className='mt-2 text-sm text-text-secondary'>
              マイクロサービスとインフラツーリングのため学習中。 シンプルで効率的なバックエンドサービスの構築を目指す。
            </p>
            <div className='mt-4 h-1 w-full rounded-full bg-bg-tertiary'>
              <div className='h-full rounded-full bg-accent-tertiary transition-all duration-slow' style={{ width: '25%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Navigation hint */}
      <div className='mt-16 flex justify-center gap-8'>
        <Link to='/projects' className='group flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent-primary'>
          <span className='transition-transform group-hover:-translate-x-1'>←</span>
          <span>Projects</span>
        </Link>
        <Link to='/link' className='group flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent-primary'>
          <span>Link</span>
          <span className='transition-transform group-hover:translate-x-1'>→</span>
        </Link>
      </div>
    </main>
  );
};

export const Route = createFileRoute('/skills/')({
  component: SkillsPage,
});
