import type { FC } from "react";
import type { GitHubStats } from "../github-api";

import { useDecryptNumber } from "./useDecryptAnimation";

interface StatsPanelProps {
  stats: GitHubStats;
  animate: boolean;
}

interface StatRowProps {
  label: string;
  value: number;
  suffix?: string;
  delay: number;
  animate: boolean;
  color?: "primary" | "secondary" | "tertiary";
}

const StatRow: FC<StatRowProps> = ({
  label,
  value,
  suffix = "",
  delay,
  animate,
  color = "primary",
}) => {
  const displayValue = useDecryptNumber(value, {
    enabled: animate,
    delay,
    duration: 1200,
  });

  const colorClass = {
    primary: "text-accent-primary",
    secondary: "text-accent-secondary",
    tertiary: "text-accent-tertiary",
  }[color];

  return (
    <div className="flex items-baseline justify-between border-border-subtle border-b py-2 last:border-b-0">
      <span className="font-mono text-sm text-text-muted uppercase tracking-wider">{label}</span>
      <span className={`font-mono text-lg ${colorClass}`}>
        {displayValue}
        {suffix && <span className="ml-1 text-text-muted text-xs">{suffix}</span>}
      </span>
    </div>
  );
};

const StatsPanel: FC<StatsPanelProps> = ({ stats, animate }) => {
  return (
    <div className="w-full max-w-md">
      {/* Repository stats */}
      <div className="mb-6">
        <div className="mb-3 font-mono text-text-muted text-xs">
          <span className="text-accent-primary">[</span>
          <span>REPO_STATUS</span>
          <span className="text-accent-primary">]</span>
        </div>
        <div className="rounded border border-border-subtle bg-bg-secondary/50 px-4 py-2">
          <StatRow label="TOTAL_REPOS" value={stats.user.totalRepos} delay={0} animate={animate} />
          <StatRow
            label="PUBLIC"
            value={stats.user.publicRepos}
            delay={100}
            animate={animate}
            color="secondary"
          />
          <StatRow
            label="PRIVATE"
            value={stats.user.privateRepos}
            delay={200}
            animate={animate}
            color="tertiary"
          />
        </div>
      </div>

      {/* Contribution stats */}
      <div className="mb-6">
        <div className="mb-3 font-mono text-text-muted text-xs">
          <span className="text-accent-primary">[</span>
          <span>CONTRIBUTION_LOG</span>
          <span className="text-accent-primary">]</span>
        </div>
        <div className="rounded border border-border-subtle bg-bg-secondary/50 px-4 py-2">
          <StatRow
            label="COMMITS"
            value={stats.contributions.totalCommits}
            delay={300}
            animate={animate}
          />
          <StatRow
            label="PR_MERGED"
            value={stats.contributions.totalPRs}
            delay={400}
            animate={animate}
            color="secondary"
          />
          <StatRow
            label="ISSUES"
            value={stats.contributions.totalIssues}
            delay={500}
            animate={animate}
            color="tertiary"
          />
        </div>
      </div>

      {/* Streak stats */}
      <div>
        <div className="mb-3 font-mono text-text-muted text-xs">
          <span className="text-accent-primary">[</span>
          <span>STREAK_DATA</span>
          <span className="text-accent-primary">]</span>
        </div>
        <div className="rounded border border-border-subtle bg-bg-secondary/50 px-4 py-2">
          <StatRow
            label="CURRENT_STREAK"
            value={stats.contributions.currentStreak}
            suffix="days"
            delay={600}
            animate={animate}
          />
          <StatRow
            label="LONGEST_STREAK"
            value={stats.contributions.longestStreak}
            suffix="days"
            delay={700}
            animate={animate}
            color="secondary"
          />
        </div>
      </div>

      {/* Social stats (smaller, bottom) */}
      <div className="mt-6 flex gap-4 font-mono text-text-muted text-xs">
        <span>
          FOLLOWERS: <span className="text-text-secondary">{stats.user.followers}</span>
        </span>
        <span>
          FOLLOWING: <span className="text-text-secondary">{stats.user.following}</span>
        </span>
      </div>
    </div>
  );
};

export default StatsPanel;
