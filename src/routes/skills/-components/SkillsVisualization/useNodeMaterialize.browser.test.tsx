import type { FC } from 'react';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { useNodeMaterialize } from './useNodeMaterialize';

interface TestProps {
  shouldAnimate: boolean;
  delay?: number;
}

const TestComponent: FC<TestProps> = ({ shouldAnimate, delay }) => {
  const { phase, progress, isComplete } = useNodeMaterialize({
    shouldAnimate,
    ...(delay !== undefined && { delay }),
  });

  return (
    <div>
      <div data-testid='phase'>{phase}</div>
      <div data-testid='progress'>{progress.toFixed(2)}</div>
      <div data-testid='is-complete'>{String(isComplete)}</div>
    </div>
  );
};

describe('useNodeMaterialize', () => {
  beforeEach(() => {
    delete window.__FORCE_REDUCED_MOTION__;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('no animation', () => {
    test('returns visible phase immediately when shouldAnimate=false', async () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      await render(<TestComponent shouldAnimate={false} />);

      await expect.element(page.getByTestId('phase')).toHaveTextContent('visible');
      await expect.element(page.getByTestId('progress')).toHaveTextContent('1.00');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('true');
    });
  });

  describe('reduced motion', () => {
    test('returns visible immediately when prefers-reduced-motion is enabled', async () => {
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      await render(<TestComponent shouldAnimate={true} />);

      await expect.element(page.getByTestId('phase')).toHaveTextContent('visible');
      await expect.element(page.getByTestId('progress')).toHaveTextContent('1.00');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('true');
    });
  });

  describe('animation phases', () => {
    test('starts in hidden phase when shouldAnimate=true', async () => {
      vi.useFakeTimers();

      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      await render(<TestComponent shouldAnimate={true} delay={0} />);

      // Initially should be hidden
      await expect.element(page.getByTestId('phase')).toHaveTextContent('hidden');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('false');
    });

    test('eventually reaches visible phase with shouldAnimate=true', async () => {
      vi.useFakeTimers();

      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      await render(<TestComponent shouldAnimate={true} delay={0} />);

      // Total animation time: crosshair(400) + wireframe(600) + particles(800) + flash(300) = 2100ms
      // Add buffer for animation frames
      await vi.advanceTimersByTimeAsync(3000);

      await expect.element(page.getByTestId('phase')).toHaveTextContent('visible');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('true');
    });
  });

  describe('delay', () => {
    test('waits for delay before starting animation', async () => {
      vi.useFakeTimers();

      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      await render(<TestComponent shouldAnimate={true} delay={500} />);

      // Should still be hidden before delay
      await expect.element(page.getByTestId('phase')).toHaveTextContent('hidden');

      // Advance past delay
      await vi.advanceTimersByTimeAsync(600);

      // Should have started animation (moved past hidden)
      const phaseElement = page.getByTestId('phase');
      const phaseText = phaseElement.element();
      expect(phaseText.textContent).not.toBe('hidden');
    });
  });

  describe('cleanup', () => {
    test('cancels animation on unmount', async () => {
      vi.useFakeTimers();
      const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');

      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const screen = await render(<TestComponent shouldAnimate={true} delay={0} />);

      // Start animation
      await vi.advanceTimersByTimeAsync(100);

      await screen.unmount();

      // Should have called cleanup
      expect(cancelAnimationFrameSpy).toHaveBeenCalled();

      cancelAnimationFrameSpy.mockRestore();
    });
  });
});
