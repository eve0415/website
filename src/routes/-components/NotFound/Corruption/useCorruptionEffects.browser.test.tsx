import type { FC } from 'react';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { getErrorColorClass, useCorruptionEffects } from './useCorruptionEffects';

// Mock useReducedMotion
vi.mock('#hooks/useReducedMotion', () => ({
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
      <div data-testid='current-error'>{state.currentError?.text ?? 'null'}</div>
      <div data-testid='current-error-stage'>{state.currentError?.stage ?? 'null'}</div>
      <div data-testid='error-opacity'>{state.errorOpacity.toFixed(4)}</div>
    </div>
  );
};

describe('useCorruptionEffects', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('intensity calculation', () => {
    test.each([
      { progress: 0, expected: 0 },
      { progress: 0.5, expected: 0.3536 }, // Math.pow(0.5, 1.5) ≈ 0.3536
      { progress: 1, expected: 1 },
    ])('progress $progress produces intensity ~$expected', async ({ progress, expected }) => {
      await render(<TestComponent enabled progress={progress} />);

      const intensityText = page.getByTestId('intensity').element().textContent;
      const intensity = Number.parseFloat(intensityText);

      expect(intensity).toBeCloseTo(expected, 2);
    });

    test('returns 0 intensity when disabled', async () => {
      await render(<TestComponent enabled={false} progress={0.8} />);

      await expect.element(page.getByTestId('intensity')).toHaveTextContent('0.0000');
    });
  });

  describe('staticOpacity', () => {
    test('starts at 0 with progress 0', async () => {
      await render(<TestComponent enabled progress={0} />);

      await expect.element(page.getByTestId('static-opacity')).toHaveTextContent('0.0000');
    });

    test('increases with progress', async () => {
      await render(<TestComponent enabled progress={0.5} />);

      const opacity = Number.parseFloat(page.getByTestId('static-opacity').element().textContent);
      expect(opacity).toBeGreaterThan(0);
    });

    test('caps at 0.15', async () => {
      await render(<TestComponent enabled progress={1} />);

      const opacity = Number.parseFloat(page.getByTestId('static-opacity').element().textContent);
      expect(opacity).toBeLessThanOrEqual(0.15);
    });

    test('returns 0 when disabled', async () => {
      await render(<TestComponent enabled={false} progress={1} />);

      await expect.element(page.getByTestId('static-opacity')).toHaveTextContent('0.0000');
    });
  });

  describe('error selection (getErrorForProgress)', () => {
    test('returns null when progress < 0.05', async () => {
      await render(<TestComponent enabled progress={0.03} />);

      await expect.element(page.getByTestId('current-error')).toHaveTextContent('null');
    });

    test('returns stage 1 error at low progress', async () => {
      await render(<TestComponent enabled progress={0.1} />);

      await expect.element(page.getByTestId('current-error-stage')).toHaveTextContent('1');
    });

    test('returns stage 2 error at medium progress', async () => {
      await render(<TestComponent enabled progress={0.5} />);

      await expect.element(page.getByTestId('current-error-stage')).toHaveTextContent('2');
    });

    test('returns stage 3 error at high progress', async () => {
      await render(<TestComponent enabled progress={0.8} />);

      await expect.element(page.getByTestId('current-error-stage')).toHaveTextContent('3');
    });

    test('returns null when disabled', async () => {
      await render(<TestComponent enabled={false} progress={0.8} />);

      await expect.element(page.getByTestId('current-error')).toHaveTextContent('null');
    });
  });

  describe('error opacity', () => {
    test('returns 0 when disabled', async () => {
      await render(<TestComponent enabled={false} progress={0.5} />);

      await expect.element(page.getByTestId('error-opacity')).toHaveTextContent('0.0000');
    });

    test('returns 0 when no current error (progress < 0.05)', async () => {
      await render(<TestComponent enabled progress={0.03} />);

      await expect.element(page.getByTestId('error-opacity')).toHaveTextContent('0.0000');
    });

    test('returns positive opacity when error present', async () => {
      await render(<TestComponent enabled progress={0.5} />);

      const opacity = Number.parseFloat(page.getByTestId('error-opacity').element().textContent);
      expect(opacity).toBeGreaterThan(0);
    });
  });

  describe('glitch lines', () => {
    test('empty when disabled', async () => {
      await render(<TestComponent enabled={false} progress={0.8} />);

      await expect.element(page.getByTestId('glitch-lines-count')).toHaveTextContent('0');
    });

    test('generated when enabled with progress > 0', async () => {
      await render(<TestComponent enabled progress={0.5} />);

      // Wait for interval to generate lines
      await vi.advanceTimersByTimeAsync(300);

      const count = Number.parseInt(page.getByTestId('glitch-lines-count').element().textContent, 10);
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('scanline animation', () => {
    test('offset changes over time when enabled', async () => {
      await render(<TestComponent enabled progress={0.5} />);

      const initialOffset = Number.parseInt(page.getByTestId('scanline-offset').element().textContent, 10);

      await vi.advanceTimersByTimeAsync(200);

      await expect
        .poll(() => {
          const currentOffset = Number.parseInt(page.getByTestId('scanline-offset').element().textContent, 10);
          return currentOffset;
        })
        .not.toBe(initialOffset);
    });
  });
});

describe('getErrorColorClass', () => {
  test.each([
    { language: 'java', expected: 'text-orange' },
    { language: 'python', expected: 'text-yellow-400' },
    { language: 'javascript', expected: 'text-yellow-300' },
    { language: 'node', expected: 'text-yellow-300' },
    { language: 'go', expected: 'text-cyan' },
    { language: 'c', expected: 'text-red-500' },
    { language: 'kernel', expected: 'text-red-500' },
    { language: undefined, expected: 'text-red-400' },
    { language: 'unknown', expected: 'text-red-400' },
  ])('language "$language" returns $expected', ({ language, expected }) => {
    expect(getErrorColorClass(language)).toBe(expected);
  });
});
