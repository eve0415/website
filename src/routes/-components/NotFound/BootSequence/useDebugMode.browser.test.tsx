import type { FC, RefObject } from 'react';

import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import { useDebugMode } from './useDebugMode';

const DEBUG_STORAGE_KEY = '404-debug';

// Sample message depths for testing: [0, 1, 1, 2, 0, 1]
// Index 0: depth 0 (root)
// Index 1: depth 1 (child)
// Index 2: depth 1 (sibling)
// Index 3: depth 2 (grandchild)
// Index 4: depth 0 (new root)
// Index 5: depth 1 (child)
const SAMPLE_DEPTHS = [0, 1, 1, 2, 0, 1];
const TOTAL_MESSAGES = SAMPLE_DEPTHS.length;

interface TestComponentProps {
  messageDepths?: number[];
  totalMessages?: number;
  visibleCountRef?: RefObject<number>;
}

const TestComponent: FC<TestComponentProps> = ({ messageDepths = SAMPLE_DEPTHS, totalMessages = TOTAL_MESSAGES, visibleCountRef }) => {
  const { debugState, enableDebugMode, stepContinue, stepOver, stepInto, stepOut, stepBack } = useDebugMode(messageDepths, totalMessages, visibleCountRef);

  return (
    <div>
      <div data-testid='is-enabled'>{String(debugState.isEnabled)}</div>
      <div data-testid='is-paused'>{String(debugState.isPaused)}</div>
      <div data-testid='debug-index'>{debugState.debugIndex}</div>
      <div data-testid='max-visible-depth'>{debugState.maxVisibleDepth}</div>
      {/* Manual control buttons for testing */}
      <button data-testid='enable-debug' onClick={enableDebugMode} type='button'>
        Enable
      </button>
      <button data-testid='step-continue' onClick={stepContinue} type='button'>
        Continue
      </button>
      <button data-testid='step-over' onClick={() => stepOver(messageDepths)} type='button'>
        Step Over
      </button>
      <button data-testid='step-into' onClick={() => stepInto(totalMessages)} type='button'>
        Step Into
      </button>
      <button data-testid='step-out' onClick={() => stepOut(messageDepths)} type='button'>
        Step Out
      </button>
      <button data-testid='step-back' onClick={stepBack} type='button'>
        Step Back
      </button>
    </div>
  );
};

describe('useDebugMode', () => {
  beforeEach(() => {
    localStorage.removeItem(DEBUG_STORAGE_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(DEBUG_STORAGE_KEY);
  });

  describe('initial state', () => {
    test('starts disabled by default', async () => {
      await render(<TestComponent />);

      await expect.element(page.getByTestId('is-enabled')).toHaveTextContent('false');
      await expect.element(page.getByTestId('is-paused')).toHaveTextContent('false');
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('0');
    });

    test('starts enabled if localStorage has debug flag', async () => {
      localStorage.setItem(DEBUG_STORAGE_KEY, 'true');

      await render(<TestComponent />);

      await expect.element(page.getByTestId('is-enabled')).toHaveTextContent('true');
      await expect.element(page.getByTestId('is-paused')).toHaveTextContent('true');
    });
  });

  describe('keyboard shortcuts', () => {
    test('F5 enables debug mode when disabled', async () => {
      await render(<TestComponent />);

      await expect.element(page.getByTestId('is-enabled')).toHaveTextContent('false');

      await userEvent.keyboard('{F5}');

      await expect.element(page.getByTestId('is-enabled')).toHaveTextContent('true');
      await expect.element(page.getByTestId('is-paused')).toHaveTextContent('true');
    });

    test('F5 continues when paused', async () => {
      await render(<TestComponent />);

      // Enable debug mode first
      await userEvent.keyboard('{F5}');
      await expect.element(page.getByTestId('is-paused')).toHaveTextContent('true');

      // Press F5 again to continue
      await userEvent.keyboard('{F5}');
      await expect.element(page.getByTestId('is-paused')).toHaveTextContent('false');
      await expect.element(page.getByTestId('is-enabled')).toHaveTextContent('true');
    });

    test('F5 has no effect when running (enabled but not paused)', async () => {
      await render(<TestComponent />);

      // Enable and continue
      await userEvent.keyboard('{F5}');
      await userEvent.keyboard('{F5}');
      await expect.element(page.getByTestId('is-paused')).toHaveTextContent('false');
      await expect.element(page.getByTestId('is-enabled')).toHaveTextContent('true');

      // Another F5 should not change state
      await userEvent.keyboard('{F5}');
      await expect.element(page.getByTestId('is-paused')).toHaveTextContent('false');
      await expect.element(page.getByTestId('is-enabled')).toHaveTextContent('true');
    });

    test('F6 pauses when running', async () => {
      await render(<TestComponent />);

      // Enable and continue (running state)
      await userEvent.keyboard('{F5}');
      await userEvent.keyboard('{F5}');
      await expect.element(page.getByTestId('is-paused')).toHaveTextContent('false');

      // F6 to pause
      await userEvent.keyboard('{F6}');
      await expect.element(page.getByTestId('is-paused')).toHaveTextContent('true');
    });

    test('F6 has no effect when already paused', async () => {
      await render(<TestComponent />);

      // Enable (starts paused)
      await userEvent.keyboard('{F5}');
      await expect.element(page.getByTestId('is-paused')).toHaveTextContent('true');

      // F6 should not change anything
      await userEvent.keyboard('{F6}');
      await expect.element(page.getByTestId('is-paused')).toHaveTextContent('true');
    });

    test('F6 has no effect when disabled', async () => {
      await render(<TestComponent />);

      await expect.element(page.getByTestId('is-enabled')).toHaveTextContent('false');

      await userEvent.keyboard('{F6}');

      await expect.element(page.getByTestId('is-enabled')).toHaveTextContent('false');
    });

    test('F10 steps over children when paused', async () => {
      await render(<TestComponent />);

      // Enable debug mode
      await userEvent.keyboard('{F5}');
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('0');

      // At index 0 (depth 0), step over should skip children and go to index 4 (next depth 0)
      await userEvent.keyboard('{F10}');
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('4');
    });

    test('F10 has no effect when not paused', async () => {
      await render(<TestComponent />);

      // Enable and continue (running)
      await userEvent.keyboard('{F5}');
      await userEvent.keyboard('{F5}');
      await expect.element(page.getByTestId('is-paused')).toHaveTextContent('false');

      const indexBefore = page.getByTestId('debug-index');
      await expect.element(indexBefore).toHaveTextContent('0');

      await userEvent.keyboard('{F10}');

      // Should not change
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('0');
    });

    test('F11 steps into next message when paused', async () => {
      await render(<TestComponent />);

      // Enable debug mode
      await userEvent.keyboard('{F5}');
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('0');

      // Step into should go to next message (index 1)
      await userEvent.keyboard('{F11}');
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('1');

      // And again (index 2)
      await userEvent.keyboard('{F11}');
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('2');
    });

    test('Shift+F11 steps out to shallower depth', async () => {
      await render(<TestComponent />);

      // Enable and step to index 3 (depth 2)
      await userEvent.keyboard('{F5}');
      await page.getByTestId('step-into').click();
      await page.getByTestId('step-into').click();
      await page.getByTestId('step-into').click();
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('3');

      // Step out should go to index 4 (depth 0, first shallower than 2)
      await userEvent.keyboard('{Shift>}{F11}{/Shift}');
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('4');
    });

    test('Shift+F10 steps back to previous message', async () => {
      await render(<TestComponent />);

      // Enable and step forward twice
      await userEvent.keyboard('{F5}');
      await page.getByTestId('step-into').click();
      await page.getByTestId('step-into').click();
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('2');

      // Step back should go to index 1
      await userEvent.keyboard('{Shift>}{F10}{/Shift}');
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('1');
    });

    test('Escape stops debug mode', async () => {
      await render(<TestComponent />);

      // Enable debug mode
      await userEvent.keyboard('{F5}');
      await expect.element(page.getByTestId('is-enabled')).toHaveTextContent('true');

      // Escape to stop
      await userEvent.keyboard('{Escape}');
      await expect.element(page.getByTestId('is-enabled')).toHaveTextContent('false');
      await expect.element(page.getByTestId('is-paused')).toHaveTextContent('false');
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('0');
    });

    test('Ctrl+Shift+D also enables debug mode', async () => {
      await render(<TestComponent />);

      await expect.element(page.getByTestId('is-enabled')).toHaveTextContent('false');

      await userEvent.keyboard('{Control>}{Shift>}D{/Shift}{/Control}');

      await expect.element(page.getByTestId('is-enabled')).toHaveTextContent('true');
    });
  });

  describe('boundary conditions', () => {
    test('Step Into at last message triggers continue', async () => {
      await render(<TestComponent />);

      // Enable and go to last message (index 5)
      await userEvent.keyboard('{F5}');
      for (let i = 0; i < 5; i++) {
        await page.getByTestId('step-into').click();
      }
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('5');
      await expect.element(page.getByTestId('is-paused')).toHaveTextContent('true');

      // F11 at last message should trigger continue
      await userEvent.keyboard('{F11}');
      await expect.element(page.getByTestId('is-paused')).toHaveTextContent('false');
    });

    test('Step Back at index 0 stays at 0', async () => {
      await render(<TestComponent />);

      // Enable debug mode (starts at index 0)
      await userEvent.keyboard('{F5}');
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('0');

      // Step back should stay at 0
      await userEvent.keyboard('{Shift>}{F10}{/Shift}');
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('0');

      // Click button too
      await page.getByTestId('step-back').click();
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('0');
    });

    test('Step Over at last depth-0 message stays at last', async () => {
      await render(<TestComponent />);

      // Enable and go to index 4 (last depth-0 message)
      await userEvent.keyboard('{F5}');
      await page.getByTestId('step-over').click();
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('4');

      // Step over again - no more depth-0 messages, should stay
      await page.getByTestId('step-over').click();
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('4');
    });

    test('Step Out with no shallower depth stays put', async () => {
      await render(<TestComponent />);

      // Enable at index 0 (depth 0, shallowest possible)
      await userEvent.keyboard('{F5}');
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('0');

      // Step out should stay at 0 (no shallower depth exists)
      await userEvent.keyboard('{Shift>}{F11}{/Shift}');
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('0');
    });
  });

  describe('state sync', () => {
    test('Pause syncs debugIndex to current visible count', async () => {
      const visibleCountRef = { current: 3 };
      await render(<TestComponent visibleCountRef={visibleCountRef} />);

      // Enable and continue (running state)
      await userEvent.keyboard('{F5}');
      await userEvent.keyboard('{F5}');
      await expect.element(page.getByTestId('is-paused')).toHaveTextContent('false');

      // Simulate time passing - visibleCount would be updated by animation
      visibleCountRef.current = 4;

      // Pause should sync debugIndex to visibleCount - 1
      await userEvent.keyboard('{F6}');
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('3');
    });

    test('Continue resets maxVisibleDepth to Infinity', async () => {
      await render(<TestComponent />);

      // Enable debug mode
      await userEvent.keyboard('{F5}');
      await expect.element(page.getByTestId('max-visible-depth')).toHaveTextContent('Infinity');

      // Continue
      await userEvent.keyboard('{F5}');
      await expect.element(page.getByTestId('max-visible-depth')).toHaveTextContent('Infinity');
    });
  });

  describe('localStorage sync on mount (Bug 1 regression)', () => {
    test('syncs debugIndex to visibleCountRef when loaded from localStorage', async () => {
      // Set up localStorage to indicate debug mode was previously enabled
      localStorage.setItem(DEBUG_STORAGE_KEY, 'true');

      // Simulate messages already visible when component mounts
      const visibleCountRef = { current: 15 };
      await render(<TestComponent visibleCountRef={visibleCountRef} />);

      // Initial state loads from localStorage with debugIndex=0
      await expect.element(page.getByTestId('is-enabled')).toHaveTextContent('true');
      await expect.element(page.getByTestId('is-paused')).toHaveTextContent('true');

      // After mount effect runs, debugIndex should sync to visibleCountRef - 1
      // The effect uses requestAnimationFrame polling, and React needs to re-render
      // Use expect.element polling to wait for the state update
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('14');
    });

    test('keeps polling if visibleCountRef starts low and increases', async () => {
      localStorage.setItem(DEBUG_STORAGE_KEY, 'true');

      // Start with 0 messages - sync should poll until messages appear
      const visibleCountRef = { current: 0 };
      await render(<TestComponent visibleCountRef={visibleCountRef} />);

      await expect.element(page.getByTestId('is-enabled')).toHaveTextContent('true');

      // debugIndex should stay at 0 while visibleCountRef is 0
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('0');

      // Simulate messages becoming visible
      visibleCountRef.current = 8;

      // Give the RAF polling time to pick up the new value
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Now debugIndex should sync to 7 (8 - 1)
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('7');
    });

    test('does not sync if not loaded from localStorage', async () => {
      // No localStorage value set
      const visibleCountRef = { current: 10 };
      await render(<TestComponent visibleCountRef={visibleCountRef} />);

      await expect.element(page.getByTestId('is-enabled')).toHaveTextContent('false');

      // Enable via F5 - this uses enableDebugMode which has its own sync logic
      await userEvent.keyboard('{F5}');

      // Should use enableDebugMode's sync, not localStorage sync
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('9');
    });
  });

  describe('persistence', () => {
    test('Saves enabled state to localStorage', async () => {
      await render(<TestComponent />);

      expect(localStorage.getItem(DEBUG_STORAGE_KEY)).toBeNull();

      await userEvent.keyboard('{F5}');

      expect(localStorage.getItem(DEBUG_STORAGE_KEY)).toBe('true');
    });

    test('Clears localStorage when disabled', async () => {
      localStorage.setItem(DEBUG_STORAGE_KEY, 'true');

      await render(<TestComponent />);

      await expect.element(page.getByTestId('is-enabled')).toHaveTextContent('true');

      // Stop debug mode
      await userEvent.keyboard('{Escape}');

      expect(localStorage.getItem(DEBUG_STORAGE_KEY)).toBeNull();
    });

    test('Does not persist debugIndex', async () => {
      const screen1 = await render(<TestComponent />);

      // Enable and step forward
      await userEvent.keyboard('{F5}');
      await page.getByTestId('step-into').click();
      await page.getByTestId('step-into').click();
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('2');

      // Unmount first component
      await screen1.unmount();

      // Render fresh component
      await render(<TestComponent />);

      // Should start at 0 again (only enabled state persisted)
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('0');
    });
  });

  describe('step logic', () => {
    test('Step Over skips all children at current depth', async () => {
      // depths: [0, 1, 1, 2, 0, 1]
      await render(<TestComponent />);

      await userEvent.keyboard('{F5}');

      // At index 0 (depth 0), step over should skip to index 4 (next depth 0)
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('0');
      await page.getByTestId('step-over').click();
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('4');
    });

    test('Step Over at child level finds next sibling', async () => {
      // depths: [0, 1, 1, 2, 0, 1]
      await render(<TestComponent />);

      await userEvent.keyboard('{F5}');

      // Go to index 1 (depth 1)
      await page.getByTestId('step-into').click();
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('1');

      // Step over should go to index 2 (next depth 1) - skipping nothing here
      // Actually index 2 is also depth 1, so it goes there
      await page.getByTestId('step-over').click();
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('2');
    });

    test('Step Out finds next shallower depth', async () => {
      // depths: [0, 1, 1, 2, 0, 1]
      await render(<TestComponent />);

      await userEvent.keyboard('{F5}');

      // Go to index 2 (depth 1)
      await page.getByTestId('step-into').click();
      await page.getByTestId('step-into').click();
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('2');

      // Step out should find next depth 0 (index 4)
      await page.getByTestId('step-out').click();
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('4');
    });
  });

  describe('F5 enableDebugMode sync (regression)', () => {
    test('F5 syncs debugIndex to current visible message count mid-stream', async () => {
      // Simulate 10 messages already visible when F5 is pressed
      const visibleCountRef = { current: 10 };
      await render(<TestComponent visibleCountRef={visibleCountRef} />);

      // Press F5 to enable debug mode mid-stream
      await userEvent.keyboard('{F5}');

      // debugIndex should be synced to visibleCount - 1 (0-indexed)
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('9');
      await expect.element(page.getByTestId('is-enabled')).toHaveTextContent('true');
      await expect.element(page.getByTestId('is-paused')).toHaveTextContent('true');
    });

    test('F5 pressed immediately shows at least first message', async () => {
      // Simulate no messages visible yet (or just starting)
      const visibleCountRef = { current: 0 };
      await render(<TestComponent visibleCountRef={visibleCountRef} />);

      // Press F5 immediately before any messages stream
      await userEvent.keyboard('{F5}');

      // debugIndex should be 0 (shows first message)
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('0');
      await expect.element(page.getByTestId('is-enabled')).toHaveTextContent('true');
    });

    test('F5 with visibleCount of 1 sets debugIndex to 0', async () => {
      // Simulate exactly 1 message visible
      const visibleCountRef = { current: 1 };
      await render(<TestComponent visibleCountRef={visibleCountRef} />);

      await userEvent.keyboard('{F5}');

      // debugIndex should be 0 (1 - 1 = 0)
      await expect.element(page.getByTestId('debug-index')).toHaveTextContent('0');
    });
  });
});
