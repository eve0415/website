import { describe, expect, test, vi } from 'vitest';

import { COMMANDS, COMMAND_NAMES, type CommandContext, SudoRmRfError, executeCommand } from './commands';
import { mockCommandContext, mockGitHubStats } from './Terminal.fixtures';

describe('SudoRmRfError', () => {
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

describe('COMMANDS', () => {
  test('contains exactly 7 commands', () => {
    expect(COMMANDS).toHaveLength(7);
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

  test('COMMAND_NAMES matches COMMANDS names', () => {
    const names = COMMANDS.map(cmd => cmd.name);
    expect(COMMAND_NAMES).toEqual(names);
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
