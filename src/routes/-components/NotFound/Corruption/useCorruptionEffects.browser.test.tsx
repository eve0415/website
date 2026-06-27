import type { FC } from 'react';

import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { fakeTimers } from '#test/utils/disposable';

import { useCorruptionEffects } from './useCorruptionEffects';

// Mock useReducedMotion
vi.mock(import('#hooks/useReducedMotion'), () => ({
  useReducedMotion: vi.fn(() => false),
}));

interface TestComponentProps {
  enabled: boolean;
  progress: number;
}

const TestComponent: FC<TestComponentProps> = ({ enabled, progress }) => {
  const state = useCorruptionEffects({ enabled, progress });

  return (
    <div>
      <div data-testid='intensity'>{state.intensity.toFixed(4)}</div>
      <div data-testid='static-opacity'>{state.staticOpacity.toFixed(4)}</div>
      <div data-testid='glitch-lines-count'>{state.glitchLines.length}</div>
      <div data-testid='scanline-offset'>{state.scanlineOffset}</div>
    </div>
  );
};

describe('useCorruptionEffects', () => {
  describe('intensity calculation', () => {
    test.each([
      { progress: 0, expected: 0 },
      { progress: 0.5, expected: 0.3536 }, // Math.pow(0.5, 1.5) ≈ 0.3536
      { progress: 1, expected: 1 },
    ])('progress $progress produces intensity ~$expected', async ({ progress, expected }) => {
      using _ = fakeTimers();
      await render(<TestComponent enabled progress={progress} />);

      const intensityText = page.getByTestId('intensity').element().textContent;
      const intensity = Number(intensityText);

      expect(intensity).toBeCloseTo(expected, 2);
    });

    test('returns 0 intensity when disabled', async () => {
      using _ = fakeTimers();
      await render(<TestComponent enabled={false} progress={0.8} />);

      await expect.element(page.getByTestId('intensity')).toHaveTextContent('0.0000');
    });
  });

  describe('staticOpacity', () => {
    test('starts at 0 with progress 0', async () => {
      using _ = fakeTimers();
      await render(<TestComponent enabled progress={0} />);

      await expect.element(page.getByTestId('static-opacity')).toHaveTextContent('0.0000');
    });

    test('increases with progress', async () => {
      using _ = fakeTimers();
      await render(<TestComponent enabled progress={0.5} />);

      const opacity = Number(page.getByTestId('static-opacity').element().textContent);
      expect(opacity).toBeGreaterThan(0);
    });

    test('caps at 0.15', async () => {
      using _ = fakeTimers();
      await render(<TestComponent enabled progress={1} />);

      const opacity = Number(page.getByTestId('static-opacity').element().textContent);
      expect(opacity).toBeLessThanOrEqual(0.15);
    });

    test('returns 0 when disabled', async () => {
      using _ = fakeTimers();
      await render(<TestComponent enabled={false} progress={1} />);

      await expect.element(page.getByTestId('static-opacity')).toHaveTextContent('0.0000');
    });
  });

  describe('glitch lines', () => {
    test('empty when disabled', async () => {
      using _ = fakeTimers();
      await render(<TestComponent enabled={false} progress={0.8} />);

      await expect.element(page.getByTestId('glitch-lines-count')).toHaveTextContent('0');
    });

    test('generated when enabled with progress > 0', async () => {
      using _ = fakeTimers();
      await render(<TestComponent enabled progress={0.5} />);

      // Wait for interval to generate lines
      await vi.advanceTimersByTimeAsync(300);

      const count = Math.trunc(Number(page.getByTestId('glitch-lines-count').element().textContent));
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('scanline animation', () => {
    test('offset changes over time when enabled', async () => {
      using _ = fakeTimers();
      await render(<TestComponent enabled progress={0.5} />);

      const initialOffset = Math.trunc(Number(page.getByTestId('scanline-offset').element().textContent));

      await vi.advanceTimersByTimeAsync(200);

      await expect
        .poll(() => {
          const currentOffset = Math.trunc(Number(page.getByTestId('scanline-offset').element().textContent));
          return currentOffset;
        })
        .not.toBe(initialOffset);
    });
  });
});
