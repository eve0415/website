import type { GitHubStats } from '../../../-utils/github-stats-utils';
import type { FC } from 'react';

// ASCII art for neofetch
const ASCII_LOGO = [
  '███████╗██╗   ██╗███████╗',
  '██╔════╝██║   ██║ ██╔════╝',
  '█████╗   ██║   ██║█████╗  ',
  '██╔══╝   ╚██╗ ██╔╝ ██╔══╝  ',
  '███████╗ ╚████╔╝ ███████╗',
  '╚══════╝  ╚═══╝  ╚══════╝',
].join('\n');

interface NeofetchOutputProps {
  stats: GitHubStats;
}

const NeofetchOutput: FC<NeofetchOutputProps> = ({ stats }) => {
  const topLanguages = stats.languages.slice(0, 5).map(l => l.name);

  return (
    <div className='font-mono text-sm'>
      <div className='flex flex-col gap-4 md:flex-row md:gap-8'>
        {/* ASCII Art */}
        <pre className='text-neon text-xs leading-tight'>{ASCII_LOGO}</pre>

        {/* System Info */}
        <div className='flex flex-col gap-1'>
          <div>
            <span className='text-neon'>{stats.user.login}</span>
            <span className='text-subtle-foreground'>@</span>
            <span className='text-neon'>sys</span>
          </div>
          <div className='text-subtle-foreground'>────────────────</div>

          <div className='flex gap-2'>
            <span className='text-cyan'>OS:</span>
            <span>Web / Cloudflare Workers</span>
          </div>
          <div className='flex gap-2'>
            <span className='text-cyan'>Host:</span>
            <span>Cloudflare Edge Network</span>
          </div>
          <div className='flex gap-2'>
            <span className='text-cyan'>Framework:</span>
            <span>TanStack Start + React 19</span>
          </div>
          <div className='flex gap-2'>
            <span className='text-cyan'>Shell:</span>
            <span>sys.diagnostic v1.0</span>
          </div>

          <div className='text-subtle-foreground mt-2'>────────────────</div>

          <div className='flex gap-2'>
            <span className='text-cyan'>Repos:</span>
            <span>
              {stats.user.publicRepos} public, {stats.user.privateRepos} private
            </span>
          </div>
          <div className='flex gap-2'>
            <span className='text-cyan'>Commits:</span>
            <span>{stats.contributions.totalCommits.toLocaleString()}</span>
          </div>
          <div className='flex gap-2'>
            <span className='text-cyan'>Streak:</span>
            <span>
              {stats.contributions.currentStreak} days (max: {stats.contributions.longestStreak})
            </span>
          </div>
          <div className='flex gap-2'>
            <span className='text-cyan'>Languages:</span>
            <span>{topLanguages.join(', ')}</span>
          </div>

          {/* Color palette */}
          <div className='mt-2 flex gap-1'>
            <span className='h-3 w-3 bg-[#f38ba8]' />
            <span className='h-3 w-3 bg-[#fab387]' />
            <span className='h-3 w-3 bg-[#f9e2af]' />
            <span className='h-3 w-3 bg-[#a6e3a1]' />
            <span className='h-3 w-3 bg-[#89dceb]' />
            <span className='h-3 w-3 bg-[#cba6f7]' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeofetchOutput;
