import type { GitHubStats } from '../../-utils/github-stats-utils';
import type { AIToolMode } from './AIToolOutput/ai-tool-output';
import type { ReactNode } from 'react';

import { SudoRmRfError } from '#lib/sudo-rm-rf-error';

import ClaudeOutput from './ClaudeOutput/claude-output';
import CodexOutput from './CodexOutput/codex-output';
import EchoOutput from './EchoOutput/echo-output';
import GeminiOutput from './GeminiOutput/gemini-output';
import HelpOutput from './HelpOutput/help-output';
import NeofetchOutput from './NeofetchOutput/neofetch-output';
import WhoamiOutput from './WhoamiOutput/whoami-output';

// Re-exported for terminal.tsx and the command tests that import from here
export { SudoRmRfError };

export interface CommandContext {
  stats: GitHubStats;
  onNavigateHome: () => Promise<void> | void;
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

/**
 * Resolve the output mode for an AI-tool command (claude / codex / gemini)
 * from its first argument. Defaults to `login` when no recognised flag or
 * subcommand is given.
 */
const parseAIToolMode = (args: string[]): AIToolMode => {
  const firstArg = args[0]?.toLowerCase();

  if (firstArg === '--help' || firstArg === '-h') return 'help';
  if (firstArg === '--version' || firstArg === '-v') return 'version';
  if (firstArg === 'about') return 'about';
  if (firstArg === 'philosophy') return 'philosophy';
  return 'login';
};

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
      if (!userArg) return { type: 'error', message: 'sys.diagnostic: missing required flag --user' };

      // Check for unknown flags
      const unknownArgs = args.filter(a => !a.startsWith('--user='));
      if (unknownArgs.length > 0) return { type: 'error', message: `sys.diagnostic: unknown flag: ${unknownArgs[0]}` };

      return { type: 'diagnostic' };
    },
  },
  {
    name: 'claude',
    description: 'Anthropic AI assistant',
    execute: args => ({ type: 'output', content: <ClaudeOutput mode={parseAIToolMode(args)} /> }),
  },
  {
    name: 'codex',
    description: 'OpenAI code assistant',
    execute: args => ({ type: 'output', content: <CodexOutput mode={parseAIToolMode(args)} /> }),
  },
  {
    name: 'gemini',
    description: 'Google AI assistant',
    execute: args => ({ type: 'output', content: <GeminiOutput mode={parseAIToolMode(args)} /> }),
  },
  {
    name: 'sudo',
    description: 'Execute as superuser',
    execute: args => {
      // Check for rm -rf pattern
      const argsStr = args.join(' ');
      if (argsStr.includes('rm') && (argsStr.includes('-rf') || argsStr.includes('-fr'))) return { type: 'crash' };

      return {
        type: 'error',
        message: `sudo: ${args[0] ?? 'command'}: permission denied`,
      };
    },
  },
];

export const COMMAND_NAMES = COMMANDS.map(cmd => cmd.name);

// Shell-style argument parser that handles quoted strings
export const parseArgs = (input: string): string[] => {
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
