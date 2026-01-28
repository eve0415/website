import type { CommandContext } from './commands';

import { describe, expect, test, vi } from 'vitest';

import { COMMANDS, COMMAND_NAMES, SudoRmRfError, executeCommand, parseArgs } from './commands';
import { mockCommandContext, mockGitHubStats } from './terminal.fixtures';

describe('sudoRmRfError', () => {
  test('creates error with correct name', () => {
    const error = new SudoRmRfError();
    expect(error.name).toBe('SudoRmRfError');
  });

  test('creates error with correct message', () => {
    const error = new SudoRmRfError();
    expect(error.message).toBe('SYSTEM_DIAGNOSTIC_FAILURE');
  });

  test('is instanceof Error', () => {
    const error = new SudoRmRfError();
    expect(error).toBeInstanceOf(Error);
  });
});

describe('parseArgs', () => {
  test('splits basic whitespace-separated args', () => {
    expect(parseArgs('hello world')).toStrictEqual(['hello', 'world']);
  });

  test('handles double-quoted strings', () => {
    expect(parseArgs('"hello world"')).toStrictEqual(['hello world']);
  });

  test('handles single-quoted strings', () => {
    expect(parseArgs("'hello world'")).toStrictEqual(['hello world']);
  });

  test('handles mixed quoted and unquoted args', () => {
    expect(parseArgs('hello "cruel world"')).toStrictEqual(['hello', 'cruel world']);
  });

  test('handles escaped quotes in double quotes', () => {
    expect(parseArgs(String.raw`"say \"hi\""`)).toStrictEqual(['say "hi"']);
  });

  test('handles single quote inside double quotes', () => {
    expect(parseArgs('"it\'s fine"')).toStrictEqual(["it's fine"]);
  });

  test('handles double quote inside single quotes', () => {
    expect(parseArgs('\'say "hi"\'')).toStrictEqual(['say "hi"']);
  });

  test('returns empty array for empty input', () => {
    expect(parseArgs('')).toStrictEqual([]);
  });

  test('returns empty array for whitespace-only input', () => {
    expect(parseArgs('   ')).toStrictEqual([]);
  });

  test('handles multiple quoted strings', () => {
    expect(parseArgs('"hello" "world"')).toStrictEqual(['hello', 'world']);
  });

  test('handles backslash outside quotes', () => {
    expect(parseArgs(String.raw`hello\ world`)).toStrictEqual(['hello world']);
  });

  test('preserves backslash in single quotes', () => {
    expect(parseArgs(String.raw`'hello\\world'`)).toStrictEqual([String.raw`hello\\world`]);
  });

  test('handles command with multiple spaces between args', () => {
    expect(parseArgs('echo   hello   world')).toStrictEqual(['echo', 'hello', 'world']);
  });
});

describe('cOMMANDS', () => {
  test('contains exactly 11 commands', () => {
    expect(COMMANDS).toHaveLength(11);
  });

  test('all commands have required properties', () => {
    for (const cmd of COMMANDS) {
      expect(cmd).toHaveProperty('name');
      expect(cmd).toHaveProperty('description');
      expect(cmd).toHaveProperty('execute');
      expect(typeof cmd.name).toBe('string');
      expect(typeof cmd.description).toBe('string');
      expect(typeof cmd.execute).toBe('function');
    }
  });

  test('cOMMAND_NAMES matches COMMANDS names', () => {
    const names = COMMANDS.map(cmd => cmd.name);
    expect(COMMAND_NAMES).toStrictEqual(names);
  });
});

describe('executeCommand', () => {
  describe('help command', () => {
    test('returns output type', () => {
      const result = executeCommand('help', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('output contains help content', () => {
      const result = executeCommand('help', mockCommandContext);
      expect(result.type).toBe('output');
      expect(result).toHaveProperty('content');
    });

    test('snapshot', () => {
      const result = executeCommand('help', mockCommandContext);
      expect(result).toMatchSnapshot();
    });
  });

  describe('clear command', () => {
    test('returns clear type', () => {
      const result = executeCommand('clear', mockCommandContext);
      expect(result.type).toBe('clear');
    });

    test('snapshot', () => {
      const result = executeCommand('clear', mockCommandContext);
      expect(result).toMatchSnapshot();
    });
  });

  describe('exit command', () => {
    test('returns exit type', () => {
      const result = executeCommand('exit', mockCommandContext);
      expect(result.type).toBe('exit');
    });

    test('needs confirmation', () => {
      const result = executeCommand('exit', mockCommandContext);
      expect(result.type).toBe('exit');
      expect(result).toHaveProperty('needsConfirmation', true);
    });

    test('snapshot', () => {
      const result = executeCommand('exit', mockCommandContext);
      expect(result).toMatchSnapshot();
    });
  });

  describe('whoami command', () => {
    test('returns output type', () => {
      const result = executeCommand('whoami', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('snapshot', () => {
      const result = executeCommand('whoami', mockCommandContext);
      expect(result).toMatchSnapshot();
    });
  });

  describe('neofetch command', () => {
    test('returns output type', () => {
      const result = executeCommand('neofetch', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('snapshot', () => {
      const result = executeCommand('neofetch', mockCommandContext);
      expect(result).toMatchSnapshot();
    });
  });

  describe('sys.diagnostic command', () => {
    test('returns diagnostic type with valid --user flag', () => {
      const result = executeCommand('sys.diagnostic --user=eve0415', mockCommandContext);
      expect(result.type).toBe('diagnostic');
    });

    test('returns error for missing --user flag', () => {
      const result = executeCommand('sys.diagnostic', mockCommandContext);
      expect(result.type).toBe('error');
      expect(result).toHaveProperty('message', expect.stringContaining('missing required flag --user'));
    });

    test('returns error for unknown flag', () => {
      const result = executeCommand('sys.diagnostic --user=eve0415 --verbose', mockCommandContext);
      expect(result.type).toBe('error');
      expect(result).toHaveProperty('message', expect.stringContaining('unknown flag'));
    });

    test('is case-insensitive for command name', () => {
      const result = executeCommand('SYS.DIAGNOSTIC --user=eve0415', mockCommandContext);
      expect(result.type).toBe('diagnostic');
    });
  });

  describe('sudo command', () => {
    describe('sudo rm -rf variations', () => {
      test('sudo rm -rf / triggers crash', () => {
        const result = executeCommand('sudo rm -rf /', mockCommandContext);
        expect(result.type).toBe('crash');
      });

      test('sudo rm -rf /* triggers crash', () => {
        const result = executeCommand('sudo rm -rf /*', mockCommandContext);
        expect(result.type).toBe('crash');
      });

      test('sudo rm -fr / triggers crash', () => {
        const result = executeCommand('sudo rm -fr /', mockCommandContext);
        expect(result.type).toBe('crash');
      });

      test('sudo rm -rf . triggers crash', () => {
        const result = executeCommand('sudo rm -rf .', mockCommandContext);
        expect(result.type).toBe('crash');
      });

      test('sudo rm -rf --no-preserve-root / triggers crash', () => {
        const result = executeCommand('sudo rm -rf --no-preserve-root /', mockCommandContext);
        expect(result.type).toBe('crash');
      });
    });

    describe('other sudo commands', () => {
      test('sudo ls returns permission denied error', () => {
        const result = executeCommand('sudo ls', mockCommandContext);
        expect(result.type).toBe('error');
        expect(result).toHaveProperty('message', expect.stringContaining('permission denied'));
      });

      test('sudo apt-get returns permission denied error', () => {
        const result = executeCommand('sudo apt-get install', mockCommandContext);
        expect(result.type).toBe('error');
        expect(result).toHaveProperty('message', expect.stringContaining('permission denied'));
      });

      test('sudo with no args returns permission denied for undefined', () => {
        const result = executeCommand('sudo', mockCommandContext);
        expect(result.type).toBe('error');
        expect(result).toHaveProperty('message', expect.stringContaining('permission denied'));
      });

      test('sudo rm (without flags) returns permission denied', () => {
        const result = executeCommand('sudo rm file.txt', mockCommandContext);
        expect(result.type).toBe('error');
      });
    });
  });

  describe('echo command', () => {
    test('returns output type', () => {
      const result = executeCommand('echo hello', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('handles empty args', () => {
      const result = executeCommand('echo', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('handles multiple words', () => {
      const result = executeCommand('echo hello world', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('handles quoted strings', () => {
      const result = executeCommand('echo "hello world"', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('snapshot', () => {
      const result = executeCommand('echo hello world', mockCommandContext);
      expect(result).toMatchSnapshot();
    });
  });

  describe('claude command', () => {
    test('returns output type with no args (login mode)', () => {
      const result = executeCommand('claude', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('returns output for --help flag', () => {
      const result = executeCommand('claude --help', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('returns output for -h flag', () => {
      const result = executeCommand('claude -h', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('returns output for --version flag', () => {
      const result = executeCommand('claude --version', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('returns output for -v flag', () => {
      const result = executeCommand('claude -v', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('returns output for about subcommand', () => {
      const result = executeCommand('claude about', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('returns output for philosophy subcommand', () => {
      const result = executeCommand('claude philosophy', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('is case-insensitive for flags', () => {
      const result = executeCommand('claude ABOUT', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('snapshot login mode', () => {
      const result = executeCommand('claude', mockCommandContext);
      expect(result).toMatchSnapshot();
    });

    test('snapshot help mode', () => {
      const result = executeCommand('claude --help', mockCommandContext);
      expect(result).toMatchSnapshot();
    });

    test('snapshot version mode', () => {
      const result = executeCommand('claude --version', mockCommandContext);
      expect(result).toMatchSnapshot();
    });

    test('snapshot about mode', () => {
      const result = executeCommand('claude about', mockCommandContext);
      expect(result).toMatchSnapshot();
    });

    test('snapshot philosophy mode', () => {
      const result = executeCommand('claude philosophy', mockCommandContext);
      expect(result).toMatchSnapshot();
    });
  });

  describe('codex command', () => {
    test('returns output type with no args (login mode)', () => {
      const result = executeCommand('codex', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('returns output for --help flag', () => {
      const result = executeCommand('codex --help', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('returns output for -h flag', () => {
      const result = executeCommand('codex -h', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('returns output for --version flag', () => {
      const result = executeCommand('codex --version', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('returns output for -v flag', () => {
      const result = executeCommand('codex -v', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('returns output for about subcommand', () => {
      const result = executeCommand('codex about', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('returns output for philosophy subcommand', () => {
      const result = executeCommand('codex philosophy', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('snapshot login mode', () => {
      const result = executeCommand('codex', mockCommandContext);
      expect(result).toMatchSnapshot();
    });

    test('snapshot help mode', () => {
      const result = executeCommand('codex --help', mockCommandContext);
      expect(result).toMatchSnapshot();
    });

    test('snapshot version mode', () => {
      const result = executeCommand('codex --version', mockCommandContext);
      expect(result).toMatchSnapshot();
    });

    test('snapshot about mode', () => {
      const result = executeCommand('codex about', mockCommandContext);
      expect(result).toMatchSnapshot();
    });

    test('snapshot philosophy mode', () => {
      const result = executeCommand('codex philosophy', mockCommandContext);
      expect(result).toMatchSnapshot();
    });
  });

  describe('gemini command', () => {
    test('returns output type with no args (login mode)', () => {
      const result = executeCommand('gemini', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('returns output for --help flag', () => {
      const result = executeCommand('gemini --help', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('returns output for -h flag', () => {
      const result = executeCommand('gemini -h', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('returns output for --version flag', () => {
      const result = executeCommand('gemini --version', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('returns output for -v flag', () => {
      const result = executeCommand('gemini -v', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('returns output for about subcommand', () => {
      const result = executeCommand('gemini about', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('returns output for philosophy subcommand', () => {
      const result = executeCommand('gemini philosophy', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('snapshot login mode', () => {
      const result = executeCommand('gemini', mockCommandContext);
      expect(result).toMatchSnapshot();
    });

    test('snapshot help mode', () => {
      const result = executeCommand('gemini --help', mockCommandContext);
      expect(result).toMatchSnapshot();
    });

    test('snapshot version mode', () => {
      const result = executeCommand('gemini --version', mockCommandContext);
      expect(result).toMatchSnapshot();
    });

    test('snapshot about mode', () => {
      const result = executeCommand('gemini about', mockCommandContext);
      expect(result).toMatchSnapshot();
    });

    test('snapshot philosophy mode', () => {
      const result = executeCommand('gemini philosophy', mockCommandContext);
      expect(result).toMatchSnapshot();
    });
  });

  describe('unknown commands', () => {
    test('returns error type', () => {
      const result = executeCommand('notacommand', mockCommandContext);
      expect(result.type).toBe('error');
    });

    test('error message contains command name', () => {
      const result = executeCommand('notacommand', mockCommandContext);
      expect(result.type).toBe('error');
      expect(result).toHaveProperty('message', expect.stringContaining('notacommand'));
    });

    test('error message follows zsh format', () => {
      const result = executeCommand('unknowncmd', mockCommandContext);
      expect(result.type).toBe('error');
      expect(result).toHaveProperty('message', 'zsh: command not found: unknowncmd');
    });

    test('handles empty command', () => {
      const result = executeCommand('', mockCommandContext);
      expect(result.type).toBe('error');
      expect(result).toHaveProperty('message', expect.stringContaining('command not found'));
    });

    test('handles whitespace-only command', () => {
      const result = executeCommand('   ', mockCommandContext);
      expect(result.type).toBe('error');
      expect(result).toHaveProperty('message', expect.stringContaining('command not found'));
    });
  });

  describe('command parsing', () => {
    test('is case-insensitive', () => {
      const lower = executeCommand('help', mockCommandContext);
      const upper = executeCommand('HELP', mockCommandContext);
      const mixed = executeCommand('HeLp', mockCommandContext);

      expect(lower.type).toBe('output');
      expect(upper.type).toBe('output');
      expect(mixed.type).toBe('output');
    });

    test('trims leading whitespace', () => {
      const result = executeCommand('  help', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('trims trailing whitespace', () => {
      const result = executeCommand('help  ', mockCommandContext);
      expect(result.type).toBe('output');
    });

    test('handles multiple spaces between args', () => {
      const result = executeCommand('sudo   rm   -rf   /', mockCommandContext);
      expect(result.type).toBe('crash');
    });

    test('passes arguments to command', () => {
      // whoami ignores args but shouldn't break
      const result = executeCommand('whoami extra args', mockCommandContext);
      expect(result.type).toBe('output');
    });
  });

  describe('context usage', () => {
    test('whoami uses context.stats.user.login', () => {
      const customContext: CommandContext = {
        stats: {
          ...mockGitHubStats,
          user: { ...mockGitHubStats.user, login: 'testuser' },
        },
        onNavigateHome: vi.fn(),
      };
      const result = executeCommand('whoami', customContext);
      expect(result.type).toBe('output');
    });

    test('neofetch uses context.stats', () => {
      const result = executeCommand('neofetch', mockCommandContext);
      expect(result.type).toBe('output');
    });
  });
});
