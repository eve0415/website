import type { FC } from 'react';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { createMediaQueryListMock } from '../../../../../test/utils/media-query-mock';

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
    globalThis.__FORCE_REDUCED_MOTION__ = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('no animation', () => {
    test('returns visible phase immediately when shouldAnimate=false', async () => {
      vi.spyOn(globalThis, 'matchMedia').mockReturnValue(createMediaQueryListMock());

      await render(<TestComponent shouldAnimate={false} />);

      await expect.element(page.getByTestId('phase')).toHaveTextContent('visible');
      await expect.element(page.getByTestId('progress')).toHaveTextContent('1.00');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('true');
    });
  });

  describe('reduced motion', () => {
    test('returns visible immediately when prefers-reduced-motion is enabled', async () => {
      vi.spyOn(globalThis, 'matchMedia').mockImplementation(query => createMediaQueryListMock(query === '(prefers-reduced-motion: reduce)', query));

      await render(<TestComponent shouldAnimate />);

      await expect.element(page.getByTestId('phase')).toHaveTextContent('visible');
      await expect.element(page.getByTestId('progress')).toHaveTextContent('1.00');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('true');
    });
  });

  describe('animation phases', () => {
    test('starts in hidden phase when shouldAnimate=true', async () => {
      vi.useFakeTimers();

      vi.spyOn(globalThis, 'matchMedia').mockReturnValue(createMediaQueryListMock());

      await render(<TestComponent shouldAnimate delay={0} />);

      // Initially should be hidden
      await expect.element(page.getByTestId('phase')).toHaveTextContent('hidden');
      await expect.element(page.getByTestId('is-complete')).toHaveTextContent('false');
    });

    test('eventually reaches visible phase with shouldAnimate=true', async () => {
      vi.useFakeTimers();

      vi.spyOn(globalThis, 'matchMedia').mockReturnValue(createMediaQueryListMock());

      await render(<TestComponent shouldAnimate delay={0} />);

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

      vi.spyOn(globalThis, 'matchMedia').mockReturnValue(createMediaQueryListMock());

      await render(<TestComponent shouldAnimate delay={500} />);

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
      const cancelAnimationFrameSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');

      vi.spyOn(globalThis, 'matchMedia').mockReturnValue(createMediaQueryListMock());

      const screen = await render(<TestComponent shouldAnimate delay={0} />);

      // Start animation
      await vi.advanceTimersByTimeAsync(100);

      await screen.unmount();

      // Should have called cleanup
      // oxlint-disable-next-line vitest(prefer-called-with) -- toHaveBeenCalled() is correct; we only care that it was called
      expect(cancelAnimationFrameSpy).toHaveBeenCalled();

      cancelAnimationFrameSpy.mockRestore();
    });
  });
});
