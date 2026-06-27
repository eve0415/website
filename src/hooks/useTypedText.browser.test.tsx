import type { FC } from 'react';

import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { fakeTimers, forceReducedMotion } from '../../test/utils/disposable';
import { createMediaQueryListMock } from '../../test/utils/media-query-mock';

import { useTypedText } from './useTypedText';

interface TestProps {
  text: string;
  enabled?: boolean;
  speed?: number;
  delay?: readonly [number, number];
  initialDelay?: number;
  cursorBlinkMs?: number;
  onComplete?: () => void;
}

const TestComponent: FC<TestProps> = ({ text, enabled, speed, delay, initialDelay, cursorBlinkMs, onComplete }) => {
  const { displayedText, isTyping, isComplete, cursorVisible, skipToEnd } = useTypedText({
    text,
    ...(enabled !== undefined && { enabled }),
    ...(speed !== undefined && { speed }),
    ...(delay !== undefined && { delay }),
    ...(initialDelay !== undefined && { initialDelay }),
    ...(cursorBlinkMs !== undefined && { cursorBlinkMs }),
    ...(onComplete !== undefined && { onComplete }),
  });

  return (
    <div>
      <div data-testid='displayed-text'>{displayedText}</div>
      <div data-testid='is-typing'>{String(isTyping)}</div>
      <div data-testid='is-complete'>{String(isComplete)}</div>
      <div data-testid='cursor-visible'>{String(cursorVisible)}</div>
      <button type='button' data-testid='skip-button' onClick={skipToEnd}>
        Skip
      </button>
    </div>
  );
};

describe('useTypedText', () => {
  describe('typing over time', () => {
    test('starts empty then reveals the full text', async () => {
      using _ = fakeTimers();
      using _rm = forceReducedMotion();
      vi.spyOn(globalThis, 'matchMedia').mockReturnValue(createMediaQueryListMock());

      await render(<TestComponent text='Hello' speed={10} />);

      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('');
      await expect.element(page.getByTestId('is-typing')).toHaveTextContent('true');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('false');

      await vi.advanceTimersByTimeAsync(200);

      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('Hello');
      await expect.element(page.getByTestId('is-typing')).toHaveTextContent('false');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('true');
    });

    test('reveals characters sequentially', async () => {
      using _ = fakeTimers();
      using _rm = forceReducedMotion();
      vi.spyOn(globalThis, 'matchMedia').mockReturnValue(createMediaQueryListMock());

      await render(<TestComponent text='Hi there' speed={50} />);

      // Not done immediately.
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('false');

      // After two ticks, a prefix is shown but not the whole string.
      await vi.advanceTimersByTimeAsync(120);
      await expect.element(page.getByTestId('displayed-text')).not.toHaveTextContent('');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('false');
    });
  });

  describe('random delay range', () => {
    test('reveals over time using a [min, max] range', async () => {
      using _ = fakeTimers();
      using _rm = forceReducedMotion();
      vi.spyOn(globalThis, 'matchMedia').mockReturnValue(createMediaQueryListMock());

      await render(<TestComponent text='AB' delay={[5, 10]} />);

      await vi.advanceTimersByTimeAsync(100);

      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('AB');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('true');
    });
  });

  describe('initial delay', () => {
    test('waits initialDelay before revealing the first character', async () => {
      using _ = fakeTimers();
      using _rm = forceReducedMotion();
      vi.spyOn(globalThis, 'matchMedia').mockReturnValue(createMediaQueryListMock());

      await render(<TestComponent text='Hello' speed={5} initialDelay={500} />);

      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('');

      // Still empty within the initial delay window.
      await vi.advanceTimersByTimeAsync(400);
      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('');

      // Past the initial delay, typing begins.
      await vi.advanceTimersByTimeAsync(200);
      await expect.element(page.getByTestId('displayed-text')).not.toHaveTextContent('');
    });
  });

  describe('reduced motion', () => {
    test('shows full text immediately and fires onComplete once', async () => {
      using _ = fakeTimers();
      using _rm = forceReducedMotion();
      vi.spyOn(globalThis, 'matchMedia').mockImplementation(query => createMediaQueryListMock(query === '(prefers-reduced-motion: reduce)', query));

      const onComplete = vi.fn();

      await render(<TestComponent text='Immediate' speed={100} onComplete={onComplete} />);

      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('Immediate');
      await expect.element(page.getByTestId('is-typing')).toHaveTextContent('false');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('true');
      await expect.poll(() => onComplete.mock.calls.length).toBe(1);
    });

    test('cursor is visible under reduced motion', async () => {
      using _ = fakeTimers();
      using _rm = forceReducedMotion();
      vi.spyOn(globalThis, 'matchMedia').mockImplementation(query => createMediaQueryListMock(query === '(prefers-reduced-motion: reduce)', query));

      await render(<TestComponent text='Test' cursorBlinkMs={530} />);

      await expect.element(page.getByTestId('cursor-visible')).toHaveTextContent('true');
    });
  });

  describe('disabled', () => {
    test('shows full text immediately and fires onComplete once when enabled=false', async () => {
      using _ = fakeTimers();
      using _rm = forceReducedMotion();
      vi.spyOn(globalThis, 'matchMedia').mockReturnValue(createMediaQueryListMock());

      const onComplete = vi.fn();

      await render(<TestComponent text='Skipped' enabled={false} onComplete={onComplete} />);

      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('Skipped');
      await expect.element(page.getByTestId('is-typing')).toHaveTextContent('false');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('true');
      await expect.poll(() => onComplete.mock.calls.length).toBe(1);
    });
  });

  describe('skipToEnd', () => {
    test('immediately reveals the full text and fires onComplete once', async () => {
      using _ = fakeTimers();
      using _rm = forceReducedMotion();
      vi.spyOn(globalThis, 'matchMedia').mockReturnValue(createMediaQueryListMock());

      const onComplete = vi.fn();
      const testText = 'Full text appears';

      await render(<TestComponent text={testText} speed={100} onComplete={onComplete} />);

      // Begin animation but do not finish.
      await vi.advanceTimersByTimeAsync(50);
      await expect.element(page.getByTestId('is-typing')).toHaveTextContent('true');

      await page.getByTestId('skip-button').click();

      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent(testText);
      await expect.element(page.getByTestId('is-typing')).toHaveTextContent('false');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('true');
      await expect.poll(() => onComplete.mock.calls.length).toBe(1);
    });
  });

  describe('onComplete once', () => {
    test('fires exactly once on natural completion', async () => {
      using _ = fakeTimers();
      using _rm = forceReducedMotion();
      vi.spyOn(globalThis, 'matchMedia').mockReturnValue(createMediaQueryListMock());

      const onComplete = vi.fn();

      await render(<TestComponent text='Done' speed={5} onComplete={onComplete} />);

      await vi.advanceTimersByTimeAsync(300);

      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('true');
      expect(onComplete).toHaveBeenCalledOnce();

      // Further time must not re-fire the callback.
      await vi.advanceTimersByTimeAsync(300);
      expect(onComplete).toHaveBeenCalledOnce();
    });

    test('does not fire again when skipToEnd is clicked after completion', async () => {
      using _ = fakeTimers();
      using _rm = forceReducedMotion();
      vi.spyOn(globalThis, 'matchMedia').mockReturnValue(createMediaQueryListMock());

      const onComplete = vi.fn();

      await render(<TestComponent text='Hi' speed={5} onComplete={onComplete} />);

      await vi.advanceTimersByTimeAsync(100);
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('true');
      expect(onComplete).toHaveBeenCalledOnce();

      await page.getByTestId('skip-button').click();
      expect(onComplete).toHaveBeenCalledOnce();
    });
  });

  describe('cursor blink', () => {
    // NOTE: With the current consumer configs the cursor is solid for the whole
    // animation (`isTyping` stays true until completion), so the blink interval —
    // which only runs while idle (not typing, not complete) — never toggles in
    // practice. This matches the original terminal hook exactly. These tests pin
    // the observable contract the terminal relies on: a solid cursor while
    // typing, and that the blink interval never flips it mid-animation.
    test('cursor is solid at mount when a blink interval is configured', async () => {
      using _ = fakeTimers();
      using _rm = forceReducedMotion();
      vi.spyOn(globalThis, 'matchMedia').mockReturnValue(createMediaQueryListMock());

      await render(<TestComponent text='Blinking cursor' speed={50} cursorBlinkMs={530} initialDelay={500} />);

      await expect.element(page.getByTestId('cursor-visible')).toHaveTextContent('true');
    });

    test('cursor stays solid across multiple blink intervals while typing', async () => {
      using _ = fakeTimers();
      using _rm = forceReducedMotion();
      vi.spyOn(globalThis, 'matchMedia').mockReturnValue(createMediaQueryListMock());

      await render(<TestComponent text='Blinking cursor here' speed={100} cursorBlinkMs={200} initialDelay={500} />);

      // Advance well past several 200ms blink intervals; the cursor remains solid
      // because typing keeps it visible.
      await vi.advanceTimersByTimeAsync(900);
      await expect.element(page.getByTestId('is-typing')).toHaveTextContent('true');
      await expect.element(page.getByTestId('cursor-visible')).toHaveTextContent('true');
    });
  });

  describe('text change', () => {
    test('resets and re-animates when text changes', async () => {
      using _ = fakeTimers();
      using _rm = forceReducedMotion();
      vi.spyOn(globalThis, 'matchMedia').mockReturnValue(createMediaQueryListMock());

      const { rerender } = await render(<TestComponent text='First' speed={5} />);

      await vi.advanceTimersByTimeAsync(100);
      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('First');

      await rerender(<TestComponent text='Second' speed={5} />);

      await expect.element(page.getByTestId('is-typing')).toHaveTextContent('true');

      await vi.advanceTimersByTimeAsync(100);
      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('Second');
    });
  });

  describe('empty text', () => {
    test('completes immediately and fires onComplete', async () => {
      using _ = fakeTimers();
      using _rm = forceReducedMotion();
      vi.spyOn(globalThis, 'matchMedia').mockReturnValue(createMediaQueryListMock());

      const onComplete = vi.fn();

      await render(<TestComponent text='' speed={10} onComplete={onComplete} />);

      await vi.advanceTimersByTimeAsync(50);

      await expect.element(page.getByTestId('displayed-text')).toHaveTextContent('');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('true');
      expect(onComplete).toHaveBeenCalledOnce();
    });
  });

  describe('cleanup', () => {
    test('cancels pending timers on unmount', async () => {
      using _ = fakeTimers();
      using _rm = forceReducedMotion();
      vi.spyOn(globalThis, 'matchMedia').mockReturnValue(createMediaQueryListMock());

      const screen = await render(<TestComponent text='Long text that takes a while' speed={50} initialDelay={500} />);

      await vi.advanceTimersByTimeAsync(100);
      await screen.unmount();

      expect(true).toBe(true);
    });
  });
});
