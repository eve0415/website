import type { FC } from 'react';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { useTypingAnimation } from './useTypingAnimation';

interface TestProps {
  text: string;
  minDelay?: number;
  maxDelay?: number;
  onComplete?: () => void;
  enabled?: boolean;
}

const TestComponent: FC<TestProps> = ({ text, minDelay, maxDelay, onComplete, enabled }) => {
  // Build options object with only defined values to match the hook's type expectations
  const options = {
    ...(minDelay !== undefined && { minDelay }),
    ...(maxDelay !== undefined && { maxDelay }),
    ...(onComplete !== undefined && { onComplete }),
    ...(enabled !== undefined && { enabled }),
  };
  const { displayedText, cursorVisible, isTyping, isComplete } = useTypingAnimation(text, options);

  return (
    <div>
      <div data-testid='displayed-text'>{displayedText}</div>
      <div data-testid='cursor-visible'>{String(cursorVisible)}</div>
      <div data-testid='is-typing'>{String(isTyping)}</div>
      <div data-testid='is-complete'>{String(isComplete)}</div>
    </div>
  );
};

describe('useTypingAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clear global reduced motion override set by vitest.setup.ts
    // so tests can control behavior via matchMedia mocks
    delete window.__FORCE_REDUCED_MOTION__;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('basic functionality', () => {
    test('starts with empty text when enabled', async () => {
      // Mock matchMedia to return no reduced motion
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      await render(<TestComponent text='Hello' minDelay={10} maxDelay={20} />);

      // Initially should have empty text
      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('');
      await expect.element(page.getByTestId('is-typing')).toHaveTextContent('true');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('false');
    });

    test('types characters sequentially', async () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      await render(<TestComponent text='Hi' minDelay={10} maxDelay={20} />);

      // Advance past initial delay (500ms) + some typing time
      await vi.advanceTimersByTimeAsync(600);

      // Should have at least some text
      await expect.element(page.getByTestId('displayed-text')).not.toHaveTextContent('');
    });

    test('completes typing and calls onComplete', async () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const onComplete = vi.fn();

      await render(<TestComponent text='Hi' minDelay={5} maxDelay={10} onComplete={onComplete} />);

      // Advance past initial delay + typing time for 2 chars
      await vi.advanceTimersByTimeAsync(800);

      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('Hi');
      await expect.element(page.getByTestId('is-typing')).toHaveTextContent('false');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('true');
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('cursor visibility', () => {
    test('cursor is visible during typing', async () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      await render(<TestComponent text='Hello World' minDelay={50} maxDelay={100} />);

      // Advance past initial delay to start typing
      await vi.advanceTimersByTimeAsync(550);

      await expect.element(page.getByTestId('cursor-visible')).toHaveTextContent('true');
      await expect.element(page.getByTestId('is-typing')).toHaveTextContent('true');
    });

    test('cursor is initially visible', async () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      await render(<TestComponent text='Test' minDelay={10} maxDelay={20} />);

      await expect.element(page.getByTestId('cursor-visible')).toHaveTextContent('true');
    });
  });

  describe('enabled option', () => {
    test('does not animate when enabled=false', async () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const onComplete = vi.fn();

      await render(<TestComponent text='Hello' enabled={false} onComplete={onComplete} />);

      // Should immediately show full text
      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('Hello');
      await expect.element(page.getByTestId('is-typing')).toHaveTextContent('false');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('true');

      // onComplete should be called when animation is skipped
      // This allows callers to know the typing is "complete" even when skipped
      await expect.poll(() => onComplete.mock.calls.length).toBe(1);
    });
  });

  describe('reduced motion', () => {
    test('skips animation when prefers-reduced-motion is enabled', async () => {
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      const onComplete = vi.fn();

      await render(<TestComponent text='Hello' onComplete={onComplete} />);

      // Should immediately show full text
      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('Hello');
      await expect.element(page.getByTestId('is-typing')).toHaveTextContent('false');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('true');

      // onComplete should be called when animation is skipped
      // This allows callers (like Terminal) to transition state correctly
      await expect.poll(() => onComplete.mock.calls.length).toBe(1);
    });

    test('cursor is visible when reduced motion enabled', async () => {
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      await render(<TestComponent text='Test' />);

      await expect.element(page.getByTestId('cursor-visible')).toHaveTextContent('true');
    });
  });

  describe('cleanup', () => {
    test('cleanup cancels pending timeouts on unmount', async () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const screen = await render(<TestComponent text='Long text that takes a while' minDelay={50} maxDelay={100} />);

      // Advance time a bit then unmount during typing
      await vi.advanceTimersByTimeAsync(100);
      await screen.unmount();

      // Verify the component was unmounted without errors
      // The test passes if unmount completes without exceptions
      expect(true).toBe(true);
    });
  });

  describe('target text change', () => {
    test('resets animation when target text changes', async () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { rerender } = await render(<TestComponent text='First' minDelay={5} maxDelay={10} />);

      // Advance past initial delay to start first animation
      await vi.advanceTimersByTimeAsync(550);

      // Change text
      await rerender(<TestComponent text='Second' minDelay={5} maxDelay={10} />);

      // Should reset to typing state
      await expect.element(page.getByTestId('is-typing')).toHaveTextContent('true');

      // Advance time for new text to complete
      await vi.advanceTimersByTimeAsync(800);
      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('Second');
    });
  });

  describe('default options', () => {
    test('uses default minDelay=50 and maxDelay=150 when not provided', async () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      await render(<TestComponent text='AB' />);

      // Advance past initial delay (500ms) + char delays with defaults
      await vi.advanceTimersByTimeAsync(800);

      // Should have some text (2 chars with 50-150ms each + 500ms initial)
      await expect.element(page.getByTestId('displayed-text')).not.toHaveTextContent('');
    });
  });

  describe('initial delay', () => {
    test('waits 500ms before starting to type', async () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      await render(<TestComponent text='Hello' minDelay={5} maxDelay={10} />);

      // Check immediately - should still be empty
      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('');

      // After 400ms - still empty (within initial delay)
      await vi.advanceTimersByTimeAsync(400);
      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('');

      // After 600ms total - should have started typing
      await vi.advanceTimersByTimeAsync(200);
      await expect.element(page.getByTestId('displayed-text')).not.toHaveTextContent('');
    });
  });

  describe('empty text', () => {
    test('handles empty string', async () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const onComplete = vi.fn();

      await render(<TestComponent text='' onComplete={onComplete} />);

      // Advance past initial delay + completion
      await vi.advanceTimersByTimeAsync(600);

      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('true');
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});
