import type { FC } from 'react';

import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { useCameraControls } from './useCameraControls';

interface TestProps {
  targetX: number | null;
  targetY: number | null;
  canvasWidth: number;
  canvasHeight: number;
  duration?: number;
}

const TestComponent: FC<TestProps> = ({ targetX, targetY, canvasWidth, canvasHeight, duration }) => {
  const { offsetX, offsetY, zoom, isAnimating, reset } = useCameraControls({
    targetX,
    targetY,
    canvasWidth,
    canvasHeight,
    ...(duration !== undefined && { duration }),
  });

  return (
    <div>
      <div data-testid='offset-x'>{offsetX.toFixed(2)}</div>
      <div data-testid='offset-y'>{offsetY.toFixed(2)}</div>
      <div data-testid='zoom'>{zoom.toFixed(2)}</div>
      <div data-testid='is-animating'>{String(isAnimating)}</div>
      <button type='button' data-testid='reset-button' onClick={reset}>
        Reset
      </button>
    </div>
  );
};

describe('useCameraControls', () => {
  describe('default camera state', () => {
    test('returns default camera when no target', async () => {
      await render(<TestComponent targetX={null} targetY={null} canvasWidth={800} canvasHeight={600} />);

      await expect.element(page.getByTestId('offset-x')).toHaveTextContent('0.00');
      await expect.element(page.getByTestId('offset-y')).toHaveTextContent('0.00');
      await expect.element(page.getByTestId('zoom')).toHaveTextContent('1.00');
      await expect.element(page.getByTestId('is-animating')).toHaveTextContent('false');
    });

    test('exposes reset function', async () => {
      await render(<TestComponent targetX={null} targetY={null} canvasWidth={800} canvasHeight={600} />);

      // Reset button should be rendered
      await expect.element(page.getByTestId('reset-button')).toBeInTheDocument();
    });
  });

  describe('cleanup', () => {
    test('cancels animation frame on unmount', async () => {
      const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');

      const screen = await render(<TestComponent targetX={400} targetY={300} canvasWidth={800} canvasHeight={600} duration={1000} />);

      await screen.unmount();

      // Animation cleanup should have been called
      expect(cancelAnimationFrameSpy).toHaveBeenCalled();

      cancelAnimationFrameSpy.mockRestore();
    });
  });

  describe('camera api', () => {
    test('provides numeric camera values', async () => {
      const { container } = await render(<TestComponent targetX={400} targetY={300} canvasWidth={800} canvasHeight={600} />);

      // All values should be numeric (formatted as X.XX)
      const offsetX = container.querySelector('[data-testid="offset-x"]')?.textContent;
      const offsetY = container.querySelector('[data-testid="offset-y"]')?.textContent;
      const zoom = container.querySelector('[data-testid="zoom"]')?.textContent;

      expect(offsetX).toMatch(/^-?\d+\.\d{2}$/);
      expect(offsetY).toMatch(/^-?\d+\.\d{2}$/);
      expect(zoom).toMatch(/^\d+\.\d{2}$/);
    });

    test('provides animating flag as boolean string', async () => {
      const { container } = await render(<TestComponent targetX={400} targetY={300} canvasWidth={800} canvasHeight={600} />);

      const isAnimating = container.querySelector('[data-testid="is-animating"]')?.textContent;
      expect(['true', 'false']).toContain(isAnimating);
    });
  });
});
