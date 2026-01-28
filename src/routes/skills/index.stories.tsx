import type { Skill } from './-config/skills-config';
import type { FC } from 'react';

import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';

import SkillCard from './-components/SkillCard/skill-card';
import SkillsVisualization from './-components/SkillsVisualization/skills-visualization';
import { categoryIcons, categoryLabels, levelConfig, skills } from './-config/skills-config';

const SkillsPage: FC = () => {
  const groupedSkills: Record<string, Skill[]> = {};
  for (const skill of skills) {
    const { category } = skill;
    const arr = groupedSkills[category];
    if (arr) arr.push(skill);
    else groupedSkills[category] = [skill];
  }

  return (
    <main className='min-h-dvh px-6 py-24 md:px-12'>
      <header className='mb-16'>
        <h1 className='animate-fade-in-up text-4xl font-bold tracking-tight md:text-5xl'>Skills Matrix</h1>
        <p className='text-muted-foreground mt-4'>技術スタック</p>
      </header>

      <div className='mb-12 flex flex-wrap gap-6'>
        {Object.entries(levelConfig).map(([level, config]) => {
          const colors: Record<string, string> = {
            neon: 'bg-neon',
            cyan: 'bg-cyan',
            orange: 'bg-orange',
          };
          return (
            <div key={level} className='flex items-center gap-2'>
              <span className={`size-3 rounded-full ${colors[config.color]}`} />
              <span className='text-subtle-foreground text-sm'>{config.label}</span>
              <span className='text-subtle-foreground font-mono text-xs'>({config.progress}%)</span>
            </div>
          );
        })}
      </div>

      <section className='mb-16'>
        <SkillsVisualization />
      </section>

      <div className='grid gap-12 lg:grid-cols-3'>
        {Object.keys(groupedSkills).map(category => (
          <section key={category}>
            <h2 className='border-line text-subtle-foreground mb-6 flex items-center gap-2 border-b pb-2 font-mono text-sm tracking-wider uppercase'>
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

      <section className='mt-24'>
        <h2 className='mb-8 text-2xl font-bold'>現在学習中</h2>
        <div className='grid gap-4 md:grid-cols-2'>
          <div className='group border-line bg-surface duration-normal hover:border-orange/30 rounded-lg border p-6 transition-all'>
            <h3 className='text-orange text-lg font-bold'>Rust</h3>
            <p className='text-muted-foreground mt-2 text-sm'>
              システムプログラミングとパフォーマンス最適化のため学習中。 メモリ安全性と並行処理の理解を深めている。
            </p>
            <div className='bg-muted mt-4 h-1 w-full rounded-full'>
              <div className='bg-orange duration-slow h-full rounded-full transition-all' style={{ width: '35%' }} />
            </div>
          </div>
          <div className='group border-line bg-surface duration-normal hover:border-orange/30 rounded-lg border p-6 transition-all'>
            <h3 className='text-orange text-lg font-bold'>Go</h3>
            <p className='text-muted-foreground mt-2 text-sm'>
              マイクロサービスとインフラツーリングのため学習中。 シンプルで効率的なバックエンドサービスの構築を目指す。
            </p>
            <div className='bg-muted mt-4 h-1 w-full rounded-full'>
              <div className='bg-orange duration-slow h-full rounded-full transition-all' style={{ width: '25%' }} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

const meta = preview.meta({
  component: SkillsPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    Story => (
      <div className='bg-background min-h-dvh'>
        <Story />
      </div>
    ),
  ],
});

export const Default = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Skills Matrix')).toBeInTheDocument();
    await expect(canvas.getByText('言語')).toBeInTheDocument();
    await expect(canvas.getByText('インフラ')).toBeInTheDocument();
    await expect(canvas.getByText('ドメイン')).toBeInTheDocument();
    await expect(canvas.getByText('現在学習中')).toBeInTheDocument();
  },
});
