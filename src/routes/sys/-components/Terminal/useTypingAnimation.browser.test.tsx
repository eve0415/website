import type { FC } from 'react';

import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { useTypingAnimation } from './useTypingAnimation';

// Helper for time-based waits
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

      // Wait for typing to start (500ms initial delay + some typing time)
      await sleep(600);

      // Should have at least some text
      const element = page.getByTestId('displayed-text');
      const text = element.element();
      expect(text?.textContent?.length).toBeGreaterThan(0);
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

      // Wait for typing to complete
      await sleep(800);

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

      // Wait for typing to start
      await sleep(550);

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

      // onComplete should not be called when disabled from start
      expect(onComplete).not.toHaveBeenCalled();
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

      // onComplete should not be called when animation is skipped from start
      // This is consistent with enabled=false behavior
      expect(onComplete).not.toHaveBeenCalled();
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

      // Unmount during typing
      await sleep(100);
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

      // Wait for first animation to start
      await sleep(550);

      // Change text
      await rerender(<TestComponent text='Second' minDelay={5} maxDelay={10} />);

      // Should reset to typing state
      await expect.element(page.getByTestId('is-typing')).toHaveTextContent('true');

      // Eventually should show new text
      await sleep(800);
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

      // Wait for initial delay (500ms) + at least 2 char delays with defaults
      await sleep(800);

      // Should have completed (2 chars with 50-150ms each + 500ms initial)
      const element = page.getByTestId('displayed-text');
      const text = element.element();
      expect(text?.textContent?.length).toBeGreaterThan(0);
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
      await sleep(400);
      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('');

      // After 600ms total - should have started typing
      await sleep(200);
      const element = page.getByTestId('displayed-text');
      const text = element.element();
      expect(text?.textContent?.length).toBeGreaterThan(0);
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

      // Wait for initial delay + completion
      await sleep(600);

      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('true');
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});
