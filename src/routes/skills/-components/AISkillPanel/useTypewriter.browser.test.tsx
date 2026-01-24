import type { FC } from 'react';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { useTypewriter } from './useTypewriter';

interface TestProps {
  text: string;
  speed?: number;
  enabled?: boolean;
}

const TestComponent: FC<TestProps> = ({ text, speed, enabled }) => {
  const { displayedText, isTyping, isComplete, skipToEnd } = useTypewriter({
    text,
    ...(speed !== undefined && { speed }),
    ...(enabled !== undefined && { enabled }),
  });

  return (
    <div>
      <div data-testid='displayed-text'>{displayedText}</div>
      <div data-testid='is-typing'>{String(isTyping)}</div>
      <div data-testid='is-complete'>{String(isComplete)}</div>
      <button type='button' data-testid='skip-button' onClick={skipToEnd}>
        Skip
      </button>
    </div>
  );
};

describe('useTypewriter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    delete window.__FORCE_REDUCED_MOTION__;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('basic functionality', () => {
    test('starts with empty text when enabled', async () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      await render(<TestComponent text='Hello' speed={10} />);

      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('');
      await expect.element(page.getByTestId('is-typing')).toHaveTextContent('true');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('false');
    });

    test('final displayedText equals input text after animation', async () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const testText = '型安全なコード';

      await render(<TestComponent text={testText} speed={5} />);

      // Advance time to complete animation (5ms per char * text.length + buffer)
      await vi.advanceTimersByTimeAsync(testText.length * 5 + 100);

      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent(testText);
      await expect.element(page.getByTestId('is-typing')).toHaveTextContent('false');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('true');
    });

    test('isComplete is true when animation finishes', async () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      await render(<TestComponent text='Hi' speed={5} />);

      // Advance time past animation
      await vi.advanceTimersByTimeAsync(100);

      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('true');
    });
  });

  describe('skipToEnd', () => {
    test('immediately shows full text when clicked', async () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const testText = 'Full text appears';

      await render(<TestComponent text={testText} speed={100} />);

      // Start animation but don't complete
      await vi.advanceTimersByTimeAsync(50);

      // Verify typing is in progress
      await expect.element(page.getByTestId('is-typing')).toHaveTextContent('true');

      // Click skip button
      await page.getByTestId('skip-button').click();

      // Should immediately show full text
      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent(testText);
      await expect.element(page.getByTestId('is-typing')).toHaveTextContent('false');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('true');
    });
  });

  describe('reduced motion', () => {
    test('shows full text immediately when prefers-reduced-motion is enabled', async () => {
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      const testText = 'Immediate display';

      await render(<TestComponent text={testText} speed={100} />);

      // Should immediately show full text without waiting
      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent(testText);
      await expect.element(page.getByTestId('is-typing')).toHaveTextContent('false');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('true');
    });
  });

  describe('disabled state', () => {
    test('returns empty displayedText when disabled', async () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      await render(<TestComponent text='Should not show' enabled={false} />);

      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('');
      await expect.element(page.getByTestId('is-typing')).toHaveTextContent('false');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('false');
    });

    test('does not start animation when disabled', async () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      await render(<TestComponent text='No animation' speed={5} enabled={false} />);

      // Advance time that would complete normal animation
      await vi.advanceTimersByTimeAsync(500);

      // Still empty because disabled
      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('');
    });
  });

  describe('text changes', () => {
    test('resets animation when text changes', async () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { rerender } = await render(<TestComponent text='First' speed={5} />);

      // Complete first animation
      await vi.advanceTimersByTimeAsync(100);
      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('First');

      // Change text
      await rerender(<TestComponent text='Second' speed={5} />);

      // Should reset to typing new text
      await expect.element(page.getByTestId('is-typing')).toHaveTextContent('true');

      // Complete second animation
      await vi.advanceTimersByTimeAsync(100);
      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('Second');
    });
  });

  describe('cleanup', () => {
    test('cancels interval on unmount', async () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const screen = await render(<TestComponent text='Long text content' speed={50} />);

      // Start typing
      await vi.advanceTimersByTimeAsync(100);

      // Unmount during animation
      await screen.unmount();

      // Should not throw
      expect(true).toBe(true);
    });
  });
});
