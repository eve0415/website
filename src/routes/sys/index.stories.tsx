import type { FC } from 'react';

import { useState } from 'react';
import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';

import CodeRadar from './-components/CodeRadar/code-radar';
import LanguageStack from './-components/LanguageStack/language-stack';
import StatsPanel from './-components/StatsPanel/stats-panel';
import { sampleStats } from './-components/StatsPanel/stats-panel.fixtures';
import { getRelativeTimeJapanese } from './-utils/github-stats-utils';

// Recreate the SysPage component with injectable stats (for Storybook)
const SysPageWithStats: FC<{ stats: typeof sampleStats }> = ({ stats }) => {
  const [hasBooted, setHasBooted] = useState(false);

  const handleBootComplete = () => {
    setHasBooted(true);
  };

  return (
    <main className='bg-background relative min-h-dvh px-4 py-8 md:px-8 lg:px-16'>
      {/* Terminal header */}
      <header className='mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
        <h1 className='text-neon font-mono text-lg md:text-xl'>
          <span className='text-subtle-foreground'>&gt; </span>
          sys.diagnostic --user=eve0415
        </h1>
        <div className='text-subtle-foreground font-mono text-xs'>
          <span>最終更新: </span>
          <span>{getRelativeTimeJapanese(stats.cachedAt)}</span>
        </div>
      </header>

      {/* Main content grid */}
      <div className='grid gap-8 lg:grid-cols-2 lg:gap-12'>
        {/* Left column: Code Radar */}
        <section className='flex flex-col items-center justify-center'>
          <CodeRadar contributionCalendar={stats.contributions.contributionCalendar} onBootComplete={handleBootComplete} />
        </section>

        {/* Right column: Stats Panel */}
        <section className='flex flex-col justify-center'>
          <StatsPanel stats={stats} animate={hasBooted} />
        </section>
      </div>

      {/* Bottom section: Language Stack */}
      <section className='mt-12'>
        <LanguageStack languages={stats.languages} animate={hasBooted} />
      </section>

      {/* Footer with keyboard hint */}
      <footer className='text-subtle-foreground mt-16 flex items-center justify-center gap-2 text-xs'>
        <kbd className='border-line rounded border px-1.5 py-0.5 font-mono text-[10px]'>4</kbd>
        <span>で戻る</span>
      </footer>
    </main>
  );
};

const meta = preview.meta({
  component: SysPageWithStats,
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
  args: {
    stats: sampleStats,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('sys.diagnostic --user=eve0415')).toBeInTheDocument();
    await expect(canvas.getByText('REPO_STATUS')).toBeInTheDocument();
    await expect(canvas.getByText('CONTRIBUTION_LOG')).toBeInTheDocument();
    await expect(canvas.getByText('STREAK_DATA')).toBeInTheDocument();
  },
});

export const WithBootAnimation = meta.story({
  args: {
    stats: sampleStats,
  },
});
