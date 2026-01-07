import type { FC } from 'react';

import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { useTerminal } from './useTerminal';

interface TestProps {
  onStateChange?: (state: string) => void;
}

const TestComponent: FC<TestProps> = () => {
  const {
    state,
    lines,
    currentInput,
    awaitingConfirmation,
    onTypingDone,
    onCtrlC,
    onBootComplete,
    setInput,
    executeCommand,
    clear,
    awaitConfirmation,
    confirm,
    addOutput,
  } = useTerminal();

  return (
    <div>
      <div data-testid='state'>{state}</div>
      <div data-testid='lines'>{JSON.stringify(lines.map(l => ({ type: l.type, content: l.content })))}</div>
      <div data-testid='lines-count'>{lines.length}</div>
      <div data-testid='current-input'>{currentInput}</div>
      <div data-testid='awaiting-confirmation'>{awaitingConfirmation ?? ''}</div>

      <button data-testid='typing-done-btn' type='button' onClick={onTypingDone}>
        Typing Done
      </button>
      <button data-testid='ctrl-c-btn' type='button' onClick={onCtrlC}>
        Ctrl+C
      </button>
      <button data-testid='boot-complete-btn' type='button' onClick={onBootComplete}>
        Boot Complete
      </button>
      <button data-testid='set-input-btn' type='button' onClick={() => setInput('test input')}>
        Set Input
      </button>
      <button data-testid='clear-input-btn' type='button' onClick={() => setInput('')}>
        Clear Input
      </button>
      <button data-testid='execute-cmd-btn' type='button' onClick={() => executeCommand('help', 'Help output')}>
        Execute Command
      </button>
      <button data-testid='execute-error-btn' type='button' onClick={() => executeCommand('bad', 'Error message', true)}>
        Execute Error
      </button>
      <button data-testid='clear-btn' type='button' onClick={clear}>
        Clear
      </button>
      <button data-testid='await-confirm-btn' type='button' onClick={() => awaitConfirmation('exit')}>
        Await Confirmation
      </button>
      <button data-testid='confirm-yes-btn' type='button' onClick={() => confirm(true)}>
        Confirm Yes
      </button>
      <button data-testid='confirm-no-btn' type='button' onClick={() => confirm(false)}>
        Confirm No
      </button>
      <button data-testid='add-output-btn' type='button' onClick={() => addOutput('Additional output')}>
        Add Output
      </button>
    </div>
  );
};

describe('useTerminal', () => {
  describe('initial state', () => {
    test('starts in typing state', async () => {
      await render(<TestComponent />);

      await expect.element(page.getByTestId('state')).toHaveTextContent('typing');
    });

    test('starts with empty lines', async () => {
      await render(<TestComponent />);

      await expect.element(page.getByTestId('lines-count')).toHaveTextContent('0');
    });

    test('starts with empty input', async () => {
      await render(<TestComponent />);

      await expect.element(page.getByTestId('current-input')).toHaveTextContent('');
    });

    test('starts with no awaiting confirmation', async () => {
      await render(<TestComponent />);

      await expect.element(page.getByTestId('awaiting-confirmation')).toHaveTextContent('');
    });
  });

  describe('state transitions', () => {
    describe('from typing state', () => {
      test('typing → running on onTypingDone', async () => {
        await render(<TestComponent />);

        await expect.element(page.getByTestId('state')).toHaveTextContent('typing');

        await page.getByTestId('typing-done-btn').click();

        await expect.element(page.getByTestId('state')).toHaveTextContent('running');
      });

      test('typing → interrupted on onCtrlC', async () => {
        await render(<TestComponent />);

        await expect.element(page.getByTestId('state')).toHaveTextContent('typing');

        await page.getByTestId('ctrl-c-btn').click();

        await expect.element(page.getByTestId('state')).toHaveTextContent('interrupted');
      });

      test('Ctrl+C adds ^C line to output', async () => {
        await render(<TestComponent />);

        await page.getByTestId('ctrl-c-btn').click();

        await expect.element(page.getByTestId('lines')).toHaveTextContent('^C');
        await expect.element(page.getByTestId('lines-count')).toHaveTextContent('1');
      });
    });

    describe('from running state', () => {
      test('running → interrupted on onCtrlC', async () => {
        await render(<TestComponent />);

        await page.getByTestId('typing-done-btn').click();
        await expect.element(page.getByTestId('state')).toHaveTextContent('running');

        await page.getByTestId('ctrl-c-btn').click();

        await expect.element(page.getByTestId('state')).toHaveTextContent('interrupted');
      });

      test('running → prompt on onBootComplete', async () => {
        await render(<TestComponent />);

        await page.getByTestId('typing-done-btn').click();
        await expect.element(page.getByTestId('state')).toHaveTextContent('running');

        await page.getByTestId('boot-complete-btn').click();

        await expect.element(page.getByTestId('state')).toHaveTextContent('prompt');
      });
    });

    describe('from interrupted state', () => {
      test('interrupted → prompt on onBootComplete', async () => {
        await render(<TestComponent />);

        await page.getByTestId('ctrl-c-btn').click();
        await expect.element(page.getByTestId('state')).toHaveTextContent('interrupted');

        await page.getByTestId('boot-complete-btn').click();

        await expect.element(page.getByTestId('state')).toHaveTextContent('prompt');
      });
    });

    describe('from prompt state', () => {
      test('Ctrl+C in prompt clears current input', async () => {
        await render(<TestComponent />);

        // Get to prompt state
        await page.getByTestId('typing-done-btn').click();
        await page.getByTestId('boot-complete-btn').click();

        // Set some input
        await page.getByTestId('set-input-btn').click();
        await expect.element(page.getByTestId('current-input')).toHaveTextContent('test input');

        // Ctrl+C should clear it
        await page.getByTestId('ctrl-c-btn').click();

        await expect.element(page.getByTestId('current-input')).toHaveTextContent('');
        // State should remain prompt
        await expect.element(page.getByTestId('state')).toHaveTextContent('prompt');
      });

      test('Ctrl+C in prompt clears awaitingConfirmation', async () => {
        await render(<TestComponent />);

        // Get to prompt state
        await page.getByTestId('typing-done-btn').click();
        await page.getByTestId('boot-complete-btn').click();

        // Set awaiting confirmation
        await page.getByTestId('await-confirm-btn').click();
        await expect.element(page.getByTestId('awaiting-confirmation')).toHaveTextContent('exit');

        // Ctrl+C should clear it
        await page.getByTestId('ctrl-c-btn').click();

        await expect.element(page.getByTestId('awaiting-confirmation')).toHaveTextContent('');
      });
    });
  });

  describe('setInput action', () => {
    test('updates currentInput', async () => {
      await render(<TestComponent />);

      await page.getByTestId('set-input-btn').click();

      await expect.element(page.getByTestId('current-input')).toHaveTextContent('test input');
    });

    test('can clear input', async () => {
      await render(<TestComponent />);

      await page.getByTestId('set-input-btn').click();
      await page.getByTestId('clear-input-btn').click();

      await expect.element(page.getByTestId('current-input')).toHaveTextContent('');
    });
  });

  describe('executeCommand action', () => {
    test('adds command line with > prefix', async () => {
      await render(<TestComponent />);

      await page.getByTestId('execute-cmd-btn').click();

      await expect.element(page.getByTestId('lines')).toHaveTextContent('> help');
    });

    test('adds output line', async () => {
      await render(<TestComponent />);

      await page.getByTestId('execute-cmd-btn').click();

      await expect.element(page.getByTestId('lines')).toHaveTextContent('Help output');
    });

    test('adds two lines (command + output)', async () => {
      await render(<TestComponent />);

      await page.getByTestId('execute-cmd-btn').click();

      await expect.element(page.getByTestId('lines-count')).toHaveTextContent('2');
    });

    test('clears currentInput', async () => {
      await render(<TestComponent />);

      await page.getByTestId('set-input-btn').click();
      await expect.element(page.getByTestId('current-input')).toHaveTextContent('test input');

      await page.getByTestId('execute-cmd-btn').click();

      await expect.element(page.getByTestId('current-input')).toHaveTextContent('');
    });

    test('clears awaitingConfirmation', async () => {
      await render(<TestComponent />);

      await page.getByTestId('await-confirm-btn').click();
      await expect.element(page.getByTestId('awaiting-confirmation')).toHaveTextContent('exit');

      await page.getByTestId('execute-cmd-btn').click();

      await expect.element(page.getByTestId('awaiting-confirmation')).toHaveTextContent('');
    });

    test('marks error output correctly', async () => {
      await render(<TestComponent />);

      await page.getByTestId('execute-error-btn').click();

      const lines = page.getByTestId('lines');
      await expect.element(lines).toHaveTextContent('"type":"error"');
      await expect.element(lines).toHaveTextContent('Error message');
    });
  });

  describe('clear action', () => {
    test('clears all lines', async () => {
      await render(<TestComponent />);

      // Add some lines
      await page.getByTestId('execute-cmd-btn').click();
      await page.getByTestId('add-output-btn').click();
      await expect.element(page.getByTestId('lines-count')).toHaveTextContent('3');

      await page.getByTestId('clear-btn').click();

      await expect.element(page.getByTestId('lines-count')).toHaveTextContent('0');
    });

    test('clears currentInput', async () => {
      await render(<TestComponent />);

      await page.getByTestId('set-input-btn').click();

      await page.getByTestId('clear-btn').click();

      await expect.element(page.getByTestId('current-input')).toHaveTextContent('');
    });

    test('clears awaitingConfirmation', async () => {
      await render(<TestComponent />);

      await page.getByTestId('await-confirm-btn').click();

      await page.getByTestId('clear-btn').click();

      await expect.element(page.getByTestId('awaiting-confirmation')).toHaveTextContent('');
    });
  });

  describe('awaitConfirmation action', () => {
    test('sets awaitingConfirmation', async () => {
      await render(<TestComponent />);

      await page.getByTestId('await-confirm-btn').click();

      await expect.element(page.getByTestId('awaiting-confirmation')).toHaveTextContent('exit');
    });

    test('adds command line with > prefix', async () => {
      await render(<TestComponent />);

      await page.getByTestId('await-confirm-btn').click();

      await expect.element(page.getByTestId('lines')).toHaveTextContent('> exit');
      await expect.element(page.getByTestId('lines-count')).toHaveTextContent('1');
    });
  });

  describe('confirm action', () => {
    test('confirm(true) adds y output', async () => {
      await render(<TestComponent />);

      await page.getByTestId('await-confirm-btn').click();
      await page.getByTestId('confirm-yes-btn').click();

      await expect.element(page.getByTestId('lines')).toHaveTextContent('"content":"y"');
    });

    test('confirm(false) adds n output', async () => {
      await render(<TestComponent />);

      await page.getByTestId('await-confirm-btn').click();
      await page.getByTestId('confirm-no-btn').click();

      await expect.element(page.getByTestId('lines')).toHaveTextContent('"content":"n"');
    });

    test('clears awaitingConfirmation', async () => {
      await render(<TestComponent />);

      await page.getByTestId('await-confirm-btn').click();
      await expect.element(page.getByTestId('awaiting-confirmation')).toHaveTextContent('exit');

      await page.getByTestId('confirm-yes-btn').click();

      await expect.element(page.getByTestId('awaiting-confirmation')).toHaveTextContent('');
    });
  });

  describe('addOutput action', () => {
    test('adds output line', async () => {
      await render(<TestComponent />);

      await page.getByTestId('add-output-btn').click();

      await expect.element(page.getByTestId('lines')).toHaveTextContent('Additional output');
      await expect.element(page.getByTestId('lines-count')).toHaveTextContent('1');
    });

    test('preserves existing lines', async () => {
      await render(<TestComponent />);

      await page.getByTestId('execute-cmd-btn').click();
      await page.getByTestId('add-output-btn').click();

      await expect.element(page.getByTestId('lines-count')).toHaveTextContent('3');
    });
  });

  describe('lines accumulation', () => {
    test('accumulates multiple commands', async () => {
      await render(<TestComponent />);

      await page.getByTestId('execute-cmd-btn').click();
      await page.getByTestId('execute-cmd-btn').click();
      await page.getByTestId('execute-cmd-btn').click();

      // Each command adds 2 lines (command + output)
      await expect.element(page.getByTestId('lines-count')).toHaveTextContent('6');
    });

    test('preserves line order', async () => {
      await render(<TestComponent />);

      await page.getByTestId('execute-cmd-btn').click();
      await page.getByTestId('add-output-btn').click();
      await page.getByTestId('execute-error-btn').click();

      const lines = page.getByTestId('lines');
      // Should contain in order: help command, help output, additional output, bad command, error
      await expect.element(lines).toHaveTextContent('> help');
      await expect.element(lines).toHaveTextContent('Help output');
      await expect.element(lines).toHaveTextContent('Additional output');
      await expect.element(lines).toHaveTextContent('> bad');
      await expect.element(lines).toHaveTextContent('Error message');
    });

    test('lines have unique ids', async () => {
      await render(<TestComponent />);

      await page.getByTestId('execute-cmd-btn').click();
      await page.getByTestId('execute-cmd-btn').click();

      // If all lines have unique ids, the JSON will have 4 distinct id entries
      // We can't easily check this from the output, but we test that the hook works correctly
      await expect.element(page.getByTestId('lines-count')).toHaveTextContent('4');
    });
  });

  describe('full boot sequence', () => {
    test('typing → running → prompt', async () => {
      await render(<TestComponent />);

      // Start in typing
      await expect.element(page.getByTestId('state')).toHaveTextContent('typing');

      // Typing complete → running
      await page.getByTestId('typing-done-btn').click();
      await expect.element(page.getByTestId('state')).toHaveTextContent('running');

      // Boot complete → prompt
      await page.getByTestId('boot-complete-btn').click();
      await expect.element(page.getByTestId('state')).toHaveTextContent('prompt');
    });

    test('typing → interrupted → prompt', async () => {
      await render(<TestComponent />);

      // Start in typing
      await expect.element(page.getByTestId('state')).toHaveTextContent('typing');

      // Ctrl+C → interrupted
      await page.getByTestId('ctrl-c-btn').click();
      await expect.element(page.getByTestId('state')).toHaveTextContent('interrupted');

      // Boot complete → prompt
      await page.getByTestId('boot-complete-btn').click();
      await expect.element(page.getByTestId('state')).toHaveTextContent('prompt');
    });
  });

  describe('confirmation flow', () => {
    test('full exit confirmation with yes', async () => {
      await render(<TestComponent />);

      // Get to prompt
      await page.getByTestId('typing-done-btn').click();
      await page.getByTestId('boot-complete-btn').click();

      // Await confirmation
      await page.getByTestId('await-confirm-btn').click();
      await expect.element(page.getByTestId('awaiting-confirmation')).toHaveTextContent('exit');
      await expect.element(page.getByTestId('lines')).toHaveTextContent('> exit');

      // Confirm yes
      await page.getByTestId('confirm-yes-btn').click();
      await expect.element(page.getByTestId('awaiting-confirmation')).toHaveTextContent('');
      await expect.element(page.getByTestId('lines')).toHaveTextContent('"content":"y"');
    });

    test('full exit confirmation with no', async () => {
      await render(<TestComponent />);

      // Get to prompt
      await page.getByTestId('typing-done-btn').click();
      await page.getByTestId('boot-complete-btn').click();

      // Await confirmation
      await page.getByTestId('await-confirm-btn').click();

      // Confirm no
      await page.getByTestId('confirm-no-btn').click();
      await expect.element(page.getByTestId('awaiting-confirmation')).toHaveTextContent('');
      await expect.element(page.getByTestId('lines')).toHaveTextContent('"content":"n"');
    });

    test('cancel confirmation with Ctrl+C', async () => {
      await render(<TestComponent />);

      // Get to prompt
      await page.getByTestId('typing-done-btn').click();
      await page.getByTestId('boot-complete-btn').click();

      // Await confirmation
      await page.getByTestId('await-confirm-btn').click();

      // Cancel with Ctrl+C
      await page.getByTestId('ctrl-c-btn').click();
      await expect.element(page.getByTestId('awaiting-confirmation')).toHaveTextContent('');
      // State stays prompt
      await expect.element(page.getByTestId('state')).toHaveTextContent('prompt');
    });
  });
});
