import type { GitHubStats } from '../../-utils/github-stats';
import type { FC } from 'react';

import StatRow from './StatRow/StatRow';

interface StatsPanelProps {
  stats: GitHubStats;
  animate: boolean;
}

const StatsPanel: FC<StatsPanelProps> = ({ stats, animate }) => {
  return (
    <div className='w-full max-w-md'>
      {/* Repository stats */}
      <div className='mb-6'>
        <div className='mb-3 font-mono text-subtle-foreground text-xs'>
          <span className='text-neon'>[</span>
          <span>REPO_STATUS</span>
          <span className='text-neon'>]</span>
        </div>
        <div className='rounded border border-line bg-surface/50 px-4 py-2'>
          <StatRow label='TOTAL_REPOS' value={stats.user.totalRepos} delay={0} animate={animate} />
          <StatRow label='PUBLIC' value={stats.user.publicRepos} delay={100} animate={animate} color='secondary' />
          <StatRow label='PRIVATE' value={stats.user.privateRepos} delay={200} animate={animate} color='tertiary' />
        </div>
      </div>

      {/* Contribution stats */}
      <div className='mb-6'>
        <div className='mb-3 font-mono text-subtle-foreground text-xs'>
          <span className='text-neon'>[</span>
          <span>CONTRIBUTION_LOG</span>
          <span className='text-neon'>]</span>
        </div>
        <div className='rounded border border-line bg-surface/50 px-4 py-2'>
          <StatRow label='COMMITS' value={stats.contributions.totalCommits} delay={300} animate={animate} />
          <StatRow label='PR_MERGED' value={stats.contributions.totalPRs} delay={400} animate={animate} color='secondary' />
          <StatRow label='ISSUES' value={stats.contributions.totalIssues} delay={500} animate={animate} color='tertiary' />
        </div>
      </div>

      {/* Streak stats */}
      <div>
        <div className='mb-3 font-mono text-subtle-foreground text-xs'>
          <span className='text-neon'>[</span>
          <span>STREAK_DATA</span>
          <span className='text-neon'>]</span>
        </div>
        <div className='rounded border border-line bg-surface/50 px-4 py-2'>
          <StatRow label='CURRENT_STREAK' value={stats.contributions.currentStreak} suffix='days' delay={600} animate={animate} />
          <StatRow label='LONGEST_STREAK' value={stats.contributions.longestStreak} suffix='days' delay={700} animate={animate} color='secondary' />
        </div>
      </div>

      {/* Social stats (smaller, bottom) */}
      <div className='mt-6 flex gap-4 font-mono text-subtle-foreground text-xs'>
        <span>
          FOLLOWERS: <span className='text-muted-foreground'>{stats.user.followers}</span>
        </span>
        <span>
          FOLLOWING: <span className='text-muted-foreground'>{stats.user.following}</span>
        </span>
      </div>
    </div>
  );
};

export default StatsPanel;
