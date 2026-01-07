import type { GitHubStats } from '../../-utils/github-stats-utils';
import type { ReactNode } from 'react';

// Custom error class for intentional BSOD trigger
export class SudoRmRfError extends Error {
  constructor() {
    super('SYSTEM_DIAGNOSTIC_FAILURE');
    this.name = 'SudoRmRfError';
  }
}

export interface CommandContext {
  stats: GitHubStats;
  onNavigateHome: () => void;
}

export interface Command {
  name: string;
  description: string;
  execute: (args: string[], context: CommandContext) => CommandResult;
}

export type CommandResult =
  | { type: 'output'; content: ReactNode }
  | { type: 'clear' }
  | { type: 'exit'; needsConfirmation: boolean }
  | { type: 'error'; message: string }
  | { type: 'crash' };

// ASCII art for neofetch
const ASCII_LOGO = `
    ███████╗██╗   ██╗███████╗
    ██╔════╝██║   ██║██╔════╝
    █████╗  ██║   ██║█████╗
    ██╔══╝  ╚██╗ ██╔╝██╔══╝
    ███████╗ ╚████╔╝ ███████╗
    ╚══════╝  ╚═══╝  ╚══════╝
`.trim();

const HelpOutput = () => (
  <div className='font-mono text-sm'>
    <div className='mb-4 text-neon'>SYS.DIAGNOSTIC(1)</div>

    <div className='mb-2 text-subtle-foreground'>NAME</div>
    <div className='mb-4 pl-4'>sys.diagnostic - system diagnostic interface</div>

    <div className='mb-2 text-subtle-foreground'>SYNOPSIS</div>
    <div className='mb-4 pl-4'>command [arguments...]</div>

    <div className='mb-2 text-subtle-foreground'>COMMANDS</div>
    <div className='pl-4'>
      <div className='flex gap-4'>
        <span className='w-20 text-neon'>help</span>
        <span>Display this help message</span>
      </div>
      <div className='flex gap-4'>
        <span className='w-20 text-neon'>clear</span>
        <span>Clear terminal output</span>
      </div>
      <div className='flex gap-4'>
        <span className='w-20 text-neon'>whoami</span>
        <span>Display current user</span>
      </div>
      <div className='flex gap-4'>
        <span className='w-20 text-neon'>neofetch</span>
        <span>Display system information</span>
      </div>
      <div className='flex gap-4'>
        <span className='w-20 text-neon'>exit</span>
        <span>Exit diagnostic mode</span>
      </div>
    </div>

    <div className='mt-4 mb-2 text-subtle-foreground'>EASTER EGGS</div>
    <div className='pl-4 text-subtle-foreground/50'>Try some dangerous commands... if you dare.</div>
  </div>
);

const NeofetchOutput = ({ stats }: { stats: GitHubStats }) => {
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

          <div className='mt-2 text-subtle-foreground'>────────────────</div>

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

const WhoamiOutput = ({ login }: { login: string }) => <div className='font-mono text-neon'>{login}</div>;

export const COMMANDS: Command[] = [
  {
    name: 'help',
    description: 'Display help message',
    execute: () => ({
      type: 'output',
      content: <HelpOutput />,
    }),
  },
  {
    name: 'clear',
    description: 'Clear terminal',
    execute: () => ({ type: 'clear' }),
  },
  {
    name: 'exit',
    description: 'Exit diagnostic mode',
    execute: () => ({ type: 'exit', needsConfirmation: true }),
  },
  {
    name: 'whoami',
    description: 'Display current user',
    execute: (_args, context) => ({
      type: 'output',
      content: <WhoamiOutput login={context.stats.user.login} />,
    }),
  },
  {
    name: 'neofetch',
    description: 'Display system info',
    execute: (_args, context) => ({
      type: 'output',
      content: <NeofetchOutput stats={context.stats} />,
    }),
  },
  {
    name: 'sudo',
    description: 'Execute as superuser',
    execute: args => {
      // Check for rm -rf pattern
      const argsStr = args.join(' ');
      if (argsStr.includes('rm') && (argsStr.includes('-rf') || argsStr.includes('-fr'))) {
        return { type: 'crash' };
      }
      return {
        type: 'error',
        message: `sudo: ${args[0] ?? 'command'}: permission denied`,
      };
    },
  },
];

export const COMMAND_NAMES = COMMANDS.map(cmd => cmd.name);

export const executeCommand = (input: string, context: CommandContext): CommandResult => {
  const parts = input.trim().split(/\s+/);
  const commandName = parts[0]?.toLowerCase() ?? '';
  const args = parts.slice(1);

  const command = COMMANDS.find(cmd => cmd.name === commandName);

  if (!command) {
    return {
      type: 'error',
      message: `zsh: command not found: ${commandName}`,
    };
  }

  return command.execute(args, context);
};
