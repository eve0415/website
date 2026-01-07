import type { FC } from 'react';

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import CodeRadar from './-components/CodeRadar/CodeRadar';
import LanguageStack from './-components/LanguageStack/LanguageStack';
import StatsPanel from './-components/StatsPanel/StatsPanel';
import { getGitHubStats } from './-utils/github-stats';
import { getRelativeTimeJapanese } from './-utils/github-stats-utils';

const SysPage: FC = () => {
  const stats = Route.useLoaderData();
  const [hasBooted, setHasBooted] = useState(false);

  const handleBootComplete = () => {
    setHasBooted(true);
  };

  return (
    <main className='relative min-h-dvh bg-background px-4 py-8 md:px-8 lg:px-16'>
      {/* Terminal header */}
      <header className='mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
        <h1 className='font-mono text-lg text-neon md:text-xl'>
          <span className='text-subtle-foreground'>&gt; </span>
          sys.diagnostic --user=eve0415
        </h1>
        <div className='font-mono text-subtle-foreground text-xs'>
          <span className='opacity-70'>最終更新: </span>
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
      <footer className='mt-16 flex items-center justify-center gap-2 text-subtle-foreground text-xs opacity-50'>
        <kbd className='rounded border border-line px-1.5 py-0.5 font-mono text-[10px]'>4</kbd>
        <span>で戻る</span>
      </footer>
    </main>
  );
};

export const Route = createFileRoute('/sys/')({
  component: SysPage,
  loader: () => getGitHubStats(),
});
