import type { GitHubStats } from '../../-utils/github-stats-utils';
import type { ReactNode } from 'react';

import ClaudeOutput from './ClaudeOutput/claude-output';
import CodexOutput from './CodexOutput/codex-output';
import EchoOutput from './EchoOutput/echo-output';
import GeminiOutput from './GeminiOutput/gemini-output';
import HelpOutput from './HelpOutput/help-output';
import NeofetchOutput from './NeofetchOutput/neofetch-output';
import WhoamiOutput from './WhoamiOutput/whoami-output';

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
  | { type: 'crash' }
  | { type: 'diagnostic' };

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
    name: 'echo',
    description: 'Display a line of text',
    execute: args => ({
      type: 'output',
      content: <EchoOutput text={args.join(' ')} />,
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
    name: 'sys.diagnostic',
    description: 'Run system diagnostics',
    execute: args => {
      // Parse args for --user flag
      const userArg = args.find(a => a.startsWith('--user='));
      if (!userArg) {
        return { type: 'error', message: 'sys.diagnostic: missing required flag --user' };
      }

      // Check for unknown flags
      const unknownArgs = args.filter(a => !a.startsWith('--user='));
      if (unknownArgs.length > 0) {
        return { type: 'error', message: `sys.diagnostic: unknown flag: ${unknownArgs[0]}` };
      }

      return { type: 'diagnostic' };
    },
  },
  {
    name: 'claude',
    description: 'Anthropic AI assistant',
    execute: args => {
      const firstArg = args[0]?.toLowerCase();
      let mode: 'login' | 'help' | 'version' | 'about' | 'philosophy' = 'login';

      if (firstArg === '--help' || firstArg === '-h') {
        mode = 'help';
      } else if (firstArg === '--version' || firstArg === '-v') {
        mode = 'version';
      } else if (firstArg === 'about') {
        mode = 'about';
      } else if (firstArg === 'philosophy') {
        mode = 'philosophy';
      }

      return { type: 'output', content: <ClaudeOutput mode={mode} /> };
    },
  },
  {
    name: 'codex',
    description: 'OpenAI code assistant',
    execute: args => {
      const firstArg = args[0]?.toLowerCase();
      let mode: 'login' | 'help' | 'version' | 'about' | 'philosophy' = 'login';

      if (firstArg === '--help' || firstArg === '-h') {
        mode = 'help';
      } else if (firstArg === '--version' || firstArg === '-v') {
        mode = 'version';
      } else if (firstArg === 'about') {
        mode = 'about';
      } else if (firstArg === 'philosophy') {
        mode = 'philosophy';
      }

      return { type: 'output', content: <CodexOutput mode={mode} /> };
    },
  },
  {
    name: 'gemini',
    description: 'Google AI assistant',
    execute: args => {
      const firstArg = args[0]?.toLowerCase();
      let mode: 'login' | 'help' | 'version' | 'about' | 'philosophy' = 'login';

      if (firstArg === '--help' || firstArg === '-h') {
        mode = 'help';
      } else if (firstArg === '--version' || firstArg === '-v') {
        mode = 'version';
      } else if (firstArg === 'about') {
        mode = 'about';
      } else if (firstArg === 'philosophy') {
        mode = 'philosophy';
      }

      return { type: 'output', content: <GeminiOutput mode={mode} /> };
    },
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

// Shell-style argument parser that handles quoted strings
const parseArgs = (input: string): string[] => {
  const args: string[] = [];
  let current = '';
  let inDouble = false;
  let inSingle = false;
  let escape = false;

  for (const char of input.trim()) {
    if (escape) {
      current += char;
      escape = false;
    } else if (char === '\\' && !inSingle) {
      escape = true;
    } else if (char === '"' && !inSingle) {
      inDouble = !inDouble;
    } else if (char === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (/\s/.test(char) && !inDouble && !inSingle) {
      if (current) args.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current) args.push(current);
  return args;
};

export const executeCommand = (input: string, context: CommandContext): CommandResult => {
  const parts = parseArgs(input);
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
