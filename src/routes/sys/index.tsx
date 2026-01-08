import type { FC } from 'react';

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import CodeRadar from './-components/CodeRadar/CodeRadar';
import LanguageStack from './-components/LanguageStack/LanguageStack';
import StatsPanel from './-components/StatsPanel/StatsPanel';
import Terminal from './-components/Terminal/Terminal';
import { getGitHubStats } from './-utils/github-stats';

const SysPage: FC = () => {
  const stats = Route.useLoaderData();
  const [hasBooted, setHasBooted] = useState(false);

  const handleBootComplete = () => {
    setHasBooted(true);
  };

  return (
    <main className='relative bg-background px-4 py-8 md:px-8 lg:px-16'>
      <Terminal stats={stats} onBootComplete={handleBootComplete}>
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
      </Terminal>
    </main>
  );
};

export const Route = createFileRoute('/sys/')({
  component: SysPage,
  loader: () => getGitHubStats(),
});
