import type { FC } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { fetchGitHubStats, getRelativeTimeJapanese } from "../-_sys/github-api";
import CodeRadar from "../-_sys/CodeRadar/CodeRadar";
import StatsPanel from "../-_sys/StatsPanel/StatsPanel";
import LanguageStack from "../-_sys/LanguageStack/LanguageStack";

const SysPage: FC = () => {
  const stats = Route.useLoaderData();
  const [hasBooted, setHasBooted] = useState(false);

  const handleBootComplete = () => {
    setHasBooted(true);
  };

  return (
    <main className="relative min-h-dvh bg-bg-primary px-4 py-8 md:px-8 lg:px-16">
      {/* Terminal header */}
      <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="font-mono text-accent-primary text-lg md:text-xl">
          <span className="text-text-muted">&gt; </span>
          sys.diagnostic --user=eve0415
        </h1>
        <div className="font-mono text-text-muted text-xs">
          <span className="opacity-70">最終更新: </span>
          <span>{getRelativeTimeJapanese(stats.cachedAt)}</span>
        </div>
      </header>

      {/* Main content grid */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left column: Code Radar */}
        <section className="flex flex-col items-center justify-center">
          <CodeRadar
            contributionCalendar={stats.contributions.contributionCalendar}
            onBootComplete={handleBootComplete}
          />
        </section>

        {/* Right column: Stats Panel */}
        <section className="flex flex-col justify-center">
          <StatsPanel stats={stats} animate={hasBooted} />
        </section>
      </div>

      {/* Bottom section: Language Stack */}
      <section className="mt-12">
        <LanguageStack languages={stats.languages} animate={hasBooted} />
      </section>

      {/* Footer with keyboard hint */}
      <footer className="mt-16 flex items-center justify-center gap-2 text-text-muted text-xs opacity-50">
        <kbd className="rounded border border-border-subtle px-1.5 py-0.5 font-mono text-[10px]">
          4
        </kbd>
        <span>で戻る</span>
      </footer>
    </main>
  );
};

export const Route = createFileRoute("/sys/")({
  component: SysPage,
  loader: () => fetchGitHubStats(),
});
