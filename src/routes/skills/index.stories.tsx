import type { Skill } from './-config/skills-config';
import type { FC } from 'react';

import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';

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
      <header className='mb-16'>
        <h1 className='animate-fade-in-up font-bold text-4xl tracking-tight md:text-5xl'>Skills Matrix</h1>
        <p className='mt-4 text-muted-foreground'>技術スタック</p>
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
              <span className='text-sm text-subtle-foreground'>{config.label}</span>
              <span className='font-mono text-subtle-foreground text-xs opacity-50'>({config.progress}%)</span>
            </div>
          );
        })}
      </div>

      <section className='mb-16'>
        <SkillsVisualization />
      </section>

      <div className='grid gap-12 lg:grid-cols-3'>
        {(Object.keys(groupedSkills) as Array<keyof typeof categoryLabels>).map(category => (
          <section key={category}>
            <h2 className='mb-6 flex items-center gap-2 border-line border-b pb-2 font-mono text-sm text-subtle-foreground uppercase tracking-wider'>
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
        <h2 className='mb-8 font-bold text-2xl'>現在学習中</h2>
        <div className='grid gap-4 md:grid-cols-2'>
          <div className='group rounded-lg border border-line bg-surface p-6 transition-all duration-normal hover:border-orange/30'>
            <h3 className='font-bold text-lg text-orange'>Rust</h3>
            <p className='mt-2 text-muted-foreground text-sm'>
              システムプログラミングとパフォーマンス最適化のため学習中。 メモリ安全性と並行処理の理解を深めている。
            </p>
            <div className='mt-4 h-1 w-full rounded-full bg-muted'>
              <div className='h-full rounded-full bg-orange transition-all duration-slow' style={{ width: '35%' }} />
            </div>
          </div>
          <div className='group rounded-lg border border-line bg-surface p-6 transition-all duration-normal hover:border-orange/30'>
            <h3 className='font-bold text-lg text-orange'>Go</h3>
            <p className='mt-2 text-muted-foreground text-sm'>
              マイクロサービスとインフラツーリングのため学習中。 シンプルで効率的なバックエンドサービスの構築を目指す。
            </p>
            <div className='mt-4 h-1 w-full rounded-full bg-muted'>
              <div className='h-full rounded-full bg-orange transition-all duration-slow' style={{ width: '25%' }} />
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
      <div className='min-h-dvh bg-background'>
        <Story />
      </div>
    ),
  ],
});

export const Default = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Skills Matrix')).toBeInTheDocument();
    await expect(canvas.getByText('// Frontend')).toBeInTheDocument();
    await expect(canvas.getByText('// Backend')).toBeInTheDocument();
    await expect(canvas.getByText('// DevOps')).toBeInTheDocument();
    await expect(canvas.getByText('現在学習中')).toBeInTheDocument();
  },
});
