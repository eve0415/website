import type { FC } from 'react';

import { useMemo } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import { useKeyboardCapture } from './useKeyboardCapture';

interface TestProps {
  enabled: boolean;
  commands: string[];
  onSubmit?: (input: string) => void;
  onCtrlC?: () => void;
  onInputChange?: (input: string) => void;
}

const TestComponent: FC<TestProps> = ({ enabled, commands, onSubmit = () => {}, onCtrlC = () => {}, onInputChange }) => {
  // Memoize commands to prevent unnecessary re-creations of handleTab callback
  const memoizedCommands = useMemo(() => commands, [commands]);

  // Build options object with only defined values
  const options = {
    enabled,
    commands: memoizedCommands,
    onSubmit,
    onCtrlC,
    ...(onInputChange !== undefined && { onInputChange }),
  };
  const { input, cursorPosition, suggestions, clearInput, setInput } = useKeyboardCapture(options);

  return (
    <div>
      <div data-testid='input'>{input}</div>
      <div data-testid='cursor-position'>{cursorPosition}</div>
      <div data-testid='input-with-cursor'>
        {input.slice(0, cursorPosition)}|{input.slice(cursorPosition)}
      </div>
      <div data-testid='suggestions'>{JSON.stringify(suggestions)}</div>
      <button data-testid='clear-btn' type='button' onClick={clearInput}>
        Clear
      </button>
      <button data-testid='set-btn' type='button' onClick={() => setInput('preset')}>
        Set
      </button>
    </div>
  );
};

describe('useKeyboardCapture', () => {
  describe('enabled state', () => {
    test('ignores input when disabled', async () => {
      await render(<TestComponent enabled={false} commands={['help', 'exit']} />);

      await userEvent.keyboard('hello');

      await expect.element(page.getByTestId('input')).toHaveTextContent('');
    });

    test('captures input when enabled', async () => {
      await render(<TestComponent enabled={true} commands={['help', 'exit']} />);

      await userEvent.keyboard('hello');

      await expect.element(page.getByTestId('input')).toHaveTextContent('hello');
    });
  });

  describe('character input', () => {
    test('appends characters on keypress', async () => {
      await render(<TestComponent enabled={true} commands={[]} />);

      await userEvent.keyboard('a');
      await expect.element(page.getByTestId('input')).toHaveTextContent('a');

      await userEvent.keyboard('b');
      await expect.element(page.getByTestId('input')).toHaveTextContent('ab');

      await userEvent.keyboard('c');
      await expect.element(page.getByTestId('input')).toHaveTextContent('abc');
    });

    test('handles special characters', async () => {
      await render(<TestComponent enabled={true} commands={[]} />);

      await userEvent.keyboard('-');
      await userEvent.keyboard('_');
      await userEvent.keyboard('/');

      await expect.element(page.getByTestId('input')).toHaveTextContent('-_/');
    });

    test('handles spaces', async () => {
      await render(<TestComponent enabled={true} commands={[]} />);

      await userEvent.keyboard('sudo rm');

      await expect.element(page.getByTestId('input')).toHaveTextContent('sudo rm');
    });
  });

  describe('backspace', () => {
    test('removes last character', async () => {
      await render(<TestComponent enabled={true} commands={[]} />);

      await userEvent.keyboard('hello');
      await userEvent.keyboard('{Backspace}');

      await expect.element(page.getByTestId('input')).toHaveTextContent('hell');
    });

    test('handles multiple backspaces', async () => {
      await render(<TestComponent enabled={true} commands={[]} />);

      await userEvent.keyboard('abc');
      await userEvent.keyboard('{Backspace}');
      await userEvent.keyboard('{Backspace}');

      await expect.element(page.getByTestId('input')).toHaveTextContent('a');
    });

    test('handles backspace on empty input', async () => {
      await render(<TestComponent enabled={true} commands={[]} />);

      await userEvent.keyboard('{Backspace}');

      await expect.element(page.getByTestId('input')).toHaveTextContent('');
    });

    test('resets tab state', async () => {
      await render(<TestComponent enabled={true} commands={['help', 'hello']} />);

      await userEvent.keyboard('hel');
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('{Tab}');

      // Should show suggestions
      await expect.element(page.getByTestId('suggestions')).not.toHaveTextContent('[]');

      await userEvent.keyboard('{Backspace}');

      // Suggestions should be cleared
      await expect.element(page.getByTestId('suggestions')).toHaveTextContent('[]');
    });
  });

  describe('enter submission', () => {
    test('calls onSubmit with trimmed input', async () => {
      const onSubmit = vi.fn();
      await render(<TestComponent enabled={true} commands={[]} onSubmit={onSubmit} />);

      await userEvent.keyboard('  test  ');
      await userEvent.keyboard('{Enter}');

      expect(onSubmit).toHaveBeenCalledWith('test');
    });

    test('clears input after submit', async () => {
      await render(<TestComponent enabled={true} commands={[]} />);

      await userEvent.keyboard('test');
      await userEvent.keyboard('{Enter}');

      await expect.element(page.getByTestId('input')).toHaveTextContent('');
    });

    test('does not submit empty input', async () => {
      const onSubmit = vi.fn();
      await render(<TestComponent enabled={true} commands={[]} onSubmit={onSubmit} />);

      await userEvent.keyboard('{Enter}');

      expect(onSubmit).not.toHaveBeenCalled();
    });

    test('does not submit whitespace-only input', async () => {
      const onSubmit = vi.fn();
      await render(<TestComponent enabled={true} commands={[]} onSubmit={onSubmit} />);

      await userEvent.keyboard('   ');
      await userEvent.keyboard('{Enter}');

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Ctrl+C', () => {
    test('calls onCtrlC callback', async () => {
      const onCtrlC = vi.fn();
      await render(<TestComponent enabled={true} commands={[]} onCtrlC={onCtrlC} />);

      await userEvent.keyboard('some input');
      await userEvent.keyboard('{Control>}c{/Control}');

      expect(onCtrlC).toHaveBeenCalledTimes(1);
    });

    test('clears input on Ctrl+C', async () => {
      await render(<TestComponent enabled={true} commands={[]} />);

      await userEvent.keyboard('test');
      await userEvent.keyboard('{Control>}c{/Control}');

      await expect.element(page.getByTestId('input')).toHaveTextContent('');
    });
  });

  describe('tab autocomplete', () => {
    describe('0 matches', () => {
      describe('1 tab', () => {
        test('does not change input', async () => {
          await render(<TestComponent enabled={true} commands={['help', 'exit']} />);

          await userEvent.keyboard('xyz');
          await userEvent.keyboard('{Tab}');

          await expect.element(page.getByTestId('input')).toHaveTextContent('xyz');
        });

        test('does not show suggestions', async () => {
          await render(<TestComponent enabled={true} commands={['help', 'exit']} />);

          await userEvent.keyboard('xyz');
          await userEvent.keyboard('{Tab}');

          await expect.element(page.getByTestId('suggestions')).toHaveTextContent('[]');
        });
      });

      describe('2 tabs', () => {
        test('does not change input', async () => {
          await render(<TestComponent enabled={true} commands={['help', 'exit']} />);

          await userEvent.keyboard('xyz');
          await userEvent.keyboard('{Tab}');
          await userEvent.keyboard('{Tab}');

          await expect.element(page.getByTestId('input')).toHaveTextContent('xyz');
        });

        test('does not show suggestions', async () => {
          await render(<TestComponent enabled={true} commands={['help', 'exit']} />);

          await userEvent.keyboard('xyz');
          await userEvent.keyboard('{Tab}');
          await userEvent.keyboard('{Tab}');

          await expect.element(page.getByTestId('suggestions')).toHaveTextContent('[]');
        });
      });
    });

    describe('1 match', () => {
      describe('1 tab', () => {
        test('auto-completes to full command', async () => {
          await render(<TestComponent enabled={true} commands={['help', 'exit', 'clear']} />);

          await userEvent.keyboard('hel');
          await userEvent.keyboard('{Tab}');

          await expect.element(page.getByTestId('input')).toHaveTextContent('help');
        });

        test('clears suggestions', async () => {
          await render(<TestComponent enabled={true} commands={['help']} />);

          await userEvent.keyboard('h');
          await userEvent.keyboard('{Tab}');

          await expect.element(page.getByTestId('suggestions')).toHaveTextContent('[]');
        });
      });

      describe('2 tabs', () => {
        test('stays at full command (already complete)', async () => {
          await render(<TestComponent enabled={true} commands={['help']} />);

          await userEvent.keyboard('h');
          await userEvent.keyboard('{Tab}');
          await userEvent.keyboard('{Tab}');

          await expect.element(page.getByTestId('input')).toHaveTextContent('help');
        });
      });
    });

    describe('multiple matches', () => {
      describe('with common prefix', () => {
        describe('1 tab', () => {
          test('extends input to common prefix', async () => {
            await render(<TestComponent enabled={true} commands={['helpme', 'helper', 'helping']} />);

            await userEvent.keyboard('hel');
            await userEvent.keyboard('{Tab}');

            await expect.element(page.getByTestId('input')).toHaveTextContent('help');
          });

          test('does not show suggestions yet', async () => {
            await render(<TestComponent enabled={true} commands={['helpme', 'helper']} />);

            await userEvent.keyboard('hel');
            await userEvent.keyboard('{Tab}');

            await expect.element(page.getByTestId('suggestions')).toHaveTextContent('[]');
          });
        });

        describe('2 tabs', () => {
          test('shows all matching commands', async () => {
            await render(<TestComponent enabled={true} commands={['helpme', 'helper', 'exit']} />);

            await userEvent.keyboard('hel');
            await userEvent.keyboard('{Tab}');
            await userEvent.keyboard('{Tab}');

            const suggestions = page.getByTestId('suggestions');
            await expect.element(suggestions).toHaveTextContent('helpme');
            await expect.element(suggestions).toHaveTextContent('helper');
          });

          test('keeps extended prefix in input', async () => {
            await render(<TestComponent enabled={true} commands={['helpme', 'helper']} />);

            await userEvent.keyboard('hel');
            await userEvent.keyboard('{Tab}');
            await userEvent.keyboard('{Tab}');

            await expect.element(page.getByTestId('input')).toHaveTextContent('help');
          });
        });
      });

      describe('no common prefix beyond input', () => {
        describe('1 tab', () => {
          test('does not change input', async () => {
            await render(<TestComponent enabled={true} commands={['help', 'hello']} />);

            await userEvent.keyboard('hel');
            await userEvent.keyboard('{Tab}');

            await expect.element(page.getByTestId('input')).toHaveTextContent('hel');
          });
        });

        describe('2 tabs', () => {
          test('shows all matching commands', async () => {
            await render(<TestComponent enabled={true} commands={['help', 'hello']} />);

            await userEvent.keyboard('hel');
            await userEvent.keyboard('{Tab}');
            await userEvent.keyboard('{Tab}');

            const suggestions = page.getByTestId('suggestions');
            await expect.element(suggestions).toHaveTextContent('help');
            await expect.element(suggestions).toHaveTextContent('hello');
          });
        });
      });
    });

    describe('input change resets tab state', () => {
      test('typing after tab resets counter', async () => {
        await render(<TestComponent enabled={true} commands={['help', 'hello']} />);

        await userEvent.keyboard('hel');
        await userEvent.keyboard('{Tab}');
        await userEvent.keyboard('p');

        // Now input is 'help' - single match, should complete on one tab
        await expect.element(page.getByTestId('input')).toHaveTextContent('help');
        await expect.element(page.getByTestId('suggestions')).toHaveTextContent('[]');
      });

      test('backspace after tab resets counter', async () => {
        await render(<TestComponent enabled={true} commands={['help', 'hello']} />);

        await userEvent.keyboard('hel');
        await userEvent.keyboard('{Tab}');
        await userEvent.keyboard('{Tab}');

        // Suggestions should be showing
        await expect.element(page.getByTestId('suggestions')).not.toHaveTextContent('[]');

        await userEvent.keyboard('{Backspace}');

        // Suggestions should be cleared
        await expect.element(page.getByTestId('suggestions')).toHaveTextContent('[]');
      });
    });

    describe('rapid tab presses', () => {
      test('handles multiple rapid tabs correctly', async () => {
        await render(<TestComponent enabled={true} commands={['help', 'hello', 'exit']} />);

        await userEvent.keyboard('hel');

        // Rapid tabs
        await userEvent.keyboard('{Tab}');
        await userEvent.keyboard('{Tab}');
        await userEvent.keyboard('{Tab}');
        await userEvent.keyboard('{Tab}');

        // Should still show suggestions (state is stable after 2nd tab)
        const suggestions = page.getByTestId('suggestions');
        await expect.element(suggestions).toHaveTextContent('help');
        await expect.element(suggestions).toHaveTextContent('hello');
      });
    });

    describe('empty input', () => {
      test('tab on empty shows no suggestions', async () => {
        await render(<TestComponent enabled={true} commands={['help', 'exit']} />);

        await userEvent.keyboard('{Tab}');

        await expect.element(page.getByTestId('suggestions')).toHaveTextContent('[]');
      });

      test('tab on empty does not change input', async () => {
        await render(<TestComponent enabled={true} commands={['help', 'exit']} />);

        await userEvent.keyboard('{Tab}');

        await expect.element(page.getByTestId('input')).toHaveTextContent('');
      });
    });

    describe('leading whitespace', () => {
      test('trims leading whitespace for matching', async () => {
        await render(<TestComponent enabled={true} commands={['help']} />);

        await userEvent.keyboard('  hel');
        await userEvent.keyboard('{Tab}');

        // Should complete to 'help' (trimmed for matching)
        await expect.element(page.getByTestId('input')).toHaveTextContent('help');
      });
    });
  });

  describe('clearInput function', () => {
    test('clears input when called', async () => {
      await render(<TestComponent enabled={true} commands={[]} />);

      await userEvent.keyboard('test');
      await page.getByTestId('clear-btn').click();

      await expect.element(page.getByTestId('input')).toHaveTextContent('');
    });

    test('clears suggestions when called', async () => {
      await render(<TestComponent enabled={true} commands={['help', 'hello']} />);

      await userEvent.keyboard('hel');
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('{Tab}');

      // Suggestions visible
      await expect.element(page.getByTestId('suggestions')).not.toHaveTextContent('[]');

      await page.getByTestId('clear-btn').click();

      await expect.element(page.getByTestId('suggestions')).toHaveTextContent('[]');
    });
  });

  describe('setInput function', () => {
    test('sets input directly', async () => {
      await render(<TestComponent enabled={true} commands={[]} />);

      await page.getByTestId('set-btn').click();

      await expect.element(page.getByTestId('input')).toHaveTextContent('preset');
    });

    test('resets tab state', async () => {
      await render(<TestComponent enabled={true} commands={['help', 'hello']} />);

      await userEvent.keyboard('hel');
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('{Tab}');

      await expect.element(page.getByTestId('suggestions')).not.toHaveTextContent('[]');

      await page.getByTestId('set-btn').click();

      await expect.element(page.getByTestId('suggestions')).toHaveTextContent('[]');
    });
  });

  describe('onInputChange callback', () => {
    test('calls onInputChange on character input', async () => {
      const onInputChange = vi.fn();
      await render(<TestComponent enabled={true} commands={[]} onInputChange={onInputChange} />);

      await userEvent.keyboard('a');

      expect(onInputChange).toHaveBeenCalledWith('a');
    });

    test('calls onInputChange on backspace', async () => {
      const onInputChange = vi.fn();
      await render(<TestComponent enabled={true} commands={[]} onInputChange={onInputChange} />);

      await userEvent.keyboard('ab');
      onInputChange.mockClear();
      await userEvent.keyboard('{Backspace}');

      expect(onInputChange).toHaveBeenCalledWith('a');
    });

    test('calls onInputChange on tab completion', async () => {
      const onInputChange = vi.fn();
      await render(<TestComponent enabled={true} commands={['help']} onInputChange={onInputChange} />);

      await userEvent.keyboard('hel');
      onInputChange.mockClear();
      await userEvent.keyboard('{Tab}');

      expect(onInputChange).toHaveBeenCalledWith('help');
    });
  });

  describe('cursor position', () => {
    describe('initial state', () => {
      test('cursor starts at position 0', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await expect.element(page.getByTestId('cursor-position')).toHaveTextContent('0');
      });
    });

    describe('character input', () => {
      test('moves cursor right after each character', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('abc');

        await expect.element(page.getByTestId('cursor-position')).toHaveTextContent('3');
        await expect.element(page.getByTestId('input-with-cursor')).toHaveTextContent('abc|');
      });

      test('inserts character at cursor position', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('ac');
        await userEvent.keyboard('{ArrowLeft}');
        await userEvent.keyboard('b');

        await expect.element(page.getByTestId('input')).toHaveTextContent('abc');
        await expect.element(page.getByTestId('input-with-cursor')).toHaveTextContent('ab|c');
      });
    });

    describe('ArrowLeft', () => {
      test('moves cursor left', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('abc');
        await userEvent.keyboard('{ArrowLeft}');

        await expect.element(page.getByTestId('cursor-position')).toHaveTextContent('2');
        await expect.element(page.getByTestId('input-with-cursor')).toHaveTextContent('ab|c');
      });

      test('stops at position 0', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('ab');
        await userEvent.keyboard('{ArrowLeft}');
        await userEvent.keyboard('{ArrowLeft}');
        await userEvent.keyboard('{ArrowLeft}');

        await expect.element(page.getByTestId('cursor-position')).toHaveTextContent('0');
      });
    });

    describe('ArrowRight', () => {
      test('moves cursor right', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('abc');
        await userEvent.keyboard('{ArrowLeft}');
        await userEvent.keyboard('{ArrowLeft}');
        await userEvent.keyboard('{ArrowRight}');

        await expect.element(page.getByTestId('cursor-position')).toHaveTextContent('2');
      });

      test('stops at end of input', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('ab');
        await userEvent.keyboard('{ArrowRight}');
        await userEvent.keyboard('{ArrowRight}');

        await expect.element(page.getByTestId('cursor-position')).toHaveTextContent('2');
      });
    });

    describe('Home', () => {
      test('moves cursor to start', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('hello');
        await userEvent.keyboard('{Home}');

        await expect.element(page.getByTestId('cursor-position')).toHaveTextContent('0');
        await expect.element(page.getByTestId('input-with-cursor')).toHaveTextContent('|hello');
      });
    });

    describe('End', () => {
      test('moves cursor to end', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('hello');
        await userEvent.keyboard('{Home}');
        await userEvent.keyboard('{End}');

        await expect.element(page.getByTestId('cursor-position')).toHaveTextContent('5');
        await expect.element(page.getByTestId('input-with-cursor')).toHaveTextContent('hello|');
      });
    });

    describe('Backspace with cursor', () => {
      test('deletes character before cursor', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('abc');
        await userEvent.keyboard('{ArrowLeft}');
        await userEvent.keyboard('{Backspace}');

        await expect.element(page.getByTestId('input')).toHaveTextContent('ac');
        await expect.element(page.getByTestId('input-with-cursor')).toHaveTextContent('a|c');
      });

      test('does nothing at position 0', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('abc');
        await userEvent.keyboard('{Home}');
        await userEvent.keyboard('{Backspace}');

        await expect.element(page.getByTestId('input')).toHaveTextContent('abc');
        await expect.element(page.getByTestId('cursor-position')).toHaveTextContent('0');
      });
    });

    describe('Delete key', () => {
      test('deletes character at cursor position (forward delete)', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('abc');
        await userEvent.keyboard('{Home}');
        await userEvent.keyboard('{Delete}');

        await expect.element(page.getByTestId('input')).toHaveTextContent('bc');
        await expect.element(page.getByTestId('cursor-position')).toHaveTextContent('0');
      });

      test('does nothing at end of input', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('abc');
        await userEvent.keyboard('{Delete}');

        await expect.element(page.getByTestId('input')).toHaveTextContent('abc');
        await expect.element(page.getByTestId('cursor-position')).toHaveTextContent('3');
      });
    });

    describe('Tab completion with cursor', () => {
      test('moves cursor to end after completion', async () => {
        await render(<TestComponent enabled={true} commands={['help']} />);

        await userEvent.keyboard('hel');
        await userEvent.keyboard('{Tab}');

        await expect.element(page.getByTestId('input')).toHaveTextContent('help');
        await expect.element(page.getByTestId('cursor-position')).toHaveTextContent('4');
      });
    });

    describe('setInput with cursor', () => {
      test('moves cursor to end after setInput', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await page.getByTestId('set-btn').click();

        await expect.element(page.getByTestId('input')).toHaveTextContent('preset');
        await expect.element(page.getByTestId('cursor-position')).toHaveTextContent('6');
      });
    });

    describe('clearInput with cursor', () => {
      test('resets cursor to 0 after clear', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('hello');
        await page.getByTestId('clear-btn').click();

        await expect.element(page.getByTestId('cursor-position')).toHaveTextContent('0');
      });
    });
  });

  describe('command history', () => {
    describe('storing commands', () => {
      test('stores executed commands', async () => {
        const onSubmit = vi.fn();
        await render(<TestComponent enabled={true} commands={[]} onSubmit={onSubmit} />);

        await userEvent.keyboard('first');
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard('second');
        await userEvent.keyboard('{Enter}');

        // Navigate up twice to verify both commands were stored
        await userEvent.keyboard('{ArrowUp}');
        await expect.element(page.getByTestId('input')).toHaveTextContent('second');

        await userEvent.keyboard('{ArrowUp}');
        await expect.element(page.getByTestId('input')).toHaveTextContent('first');
      });

      test('stores duplicate commands', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('same');
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard('same');
        await userEvent.keyboard('{Enter}');

        await userEvent.keyboard('{ArrowUp}');
        await expect.element(page.getByTestId('input')).toHaveTextContent('same');

        await userEvent.keyboard('{ArrowUp}');
        await expect.element(page.getByTestId('input')).toHaveTextContent('same');
      });
    });

    describe('ArrowUp navigation', () => {
      test('shows most recent command', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('first');
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard('second');
        await userEvent.keyboard('{Enter}');

        await userEvent.keyboard('{ArrowUp}');

        await expect.element(page.getByTestId('input')).toHaveTextContent('second');
      });

      test('saves current input as WIP', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('old');
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard('wip');
        await userEvent.keyboard('{ArrowUp}');
        await userEvent.keyboard('{ArrowDown}');

        await expect.element(page.getByTestId('input')).toHaveTextContent('wip');
      });

      test('navigates to older commands', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('first');
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard('second');
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard('third');
        await userEvent.keyboard('{Enter}');

        await userEvent.keyboard('{ArrowUp}');
        await expect.element(page.getByTestId('input')).toHaveTextContent('third');

        await userEvent.keyboard('{ArrowUp}');
        await expect.element(page.getByTestId('input')).toHaveTextContent('second');

        await userEvent.keyboard('{ArrowUp}');
        await expect.element(page.getByTestId('input')).toHaveTextContent('first');
      });

      test('stays at oldest command when pressing up at top', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('only');
        await userEvent.keyboard('{Enter}');

        await userEvent.keyboard('{ArrowUp}');
        await userEvent.keyboard('{ArrowUp}');
        await userEvent.keyboard('{ArrowUp}');

        await expect.element(page.getByTestId('input')).toHaveTextContent('only');
      });

      test('moves cursor to end of line', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('hello');
        await userEvent.keyboard('{Enter}');

        await userEvent.keyboard('{ArrowUp}');

        await expect.element(page.getByTestId('cursor-position')).toHaveTextContent('5');
      });

      test('does nothing with empty history', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('current');
        await userEvent.keyboard('{ArrowUp}');

        await expect.element(page.getByTestId('input')).toHaveTextContent('current');
      });
    });

    describe('ArrowDown navigation', () => {
      test('navigates to newer commands', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('first');
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard('second');
        await userEvent.keyboard('{Enter}');

        await userEvent.keyboard('{ArrowUp}');
        await userEvent.keyboard('{ArrowUp}');
        await userEvent.keyboard('{ArrowDown}');

        await expect.element(page.getByTestId('input')).toHaveTextContent('second');
      });

      test('restores WIP input at bottom', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('old');
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard('work in progress');
        await userEvent.keyboard('{ArrowUp}');
        await userEvent.keyboard('{ArrowDown}');

        await expect.element(page.getByTestId('input')).toHaveTextContent('work in progress');
      });

      test('does nothing when not navigating history', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('old');
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard('current');
        await userEvent.keyboard('{ArrowDown}');

        await expect.element(page.getByTestId('input')).toHaveTextContent('current');
      });
    });

    describe('history reset', () => {
      test('character input resets history navigation', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('first');
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard('second');
        await userEvent.keyboard('{Enter}');

        await userEvent.keyboard('{ArrowUp}');
        await expect.element(page.getByTestId('input')).toHaveTextContent('second');

        await userEvent.keyboard('x');
        await expect.element(page.getByTestId('input')).toHaveTextContent('secondx');

        // Now up should go back to most recent, not continue from where we were
        await userEvent.keyboard('{ArrowUp}');
        await expect.element(page.getByTestId('input')).toHaveTextContent('second');
      });

      test('Ctrl+C clears history navigation state', async () => {
        await render(<TestComponent enabled={true} commands={[]} />);

        await userEvent.keyboard('first');
        await userEvent.keyboard('{Enter}');

        await userEvent.keyboard('wip');
        await userEvent.keyboard('{ArrowUp}');
        await userEvent.keyboard('{Control>}c{/Control}');

        // Input should be cleared
        await expect.element(page.getByTestId('input')).toHaveTextContent('');

        // Up should still work and show the old command
        await userEvent.keyboard('{ArrowUp}');
        await expect.element(page.getByTestId('input')).toHaveTextContent('first');
      });
    });
  });
});
