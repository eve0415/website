import type { Phase } from './usePhaseController';
import type { FC } from 'react';

import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { useMouseInfluence } from './useMouseInfluence';

interface TestComponentProps {
  phase: Phase;
  enabled?: boolean;
}

const TestComponent: FC<TestComponentProps> = ({ phase, enabled = true }) => {
  const influence = useMouseInfluence({ phase, enabled });

  return (
    <div data-testid='container' style={{ width: '100vw', height: '100vh' }}>
      <div data-testid='position-x'>{influence.position.x.toFixed(2)}</div>
      <div data-testid='position-y'>{influence.position.y.toFixed(2)}</div>
      <div data-testid='velocity-x'>{influence.velocity.x.toFixed(2)}</div>
      <div data-testid='velocity-y'>{influence.velocity.y.toFixed(2)}</div>
      <div data-testid='normalized-x'>{influence.normalizedPosition.x.toFixed(4)}</div>
      <div data-testid='normalized-y'>{influence.normalizedPosition.y.toFixed(4)}</div>
      <div data-testid='glow-intensity'>{influence.glowIntensity.toFixed(2)}</div>
      <div data-testid='disruption-radius'>{influence.disruptionRadius}</div>
      <div data-testid='pull-strength'>{influence.pullStrength}</div>
      <div data-testid='repel-force'>{influence.repelForce}</div>
    </div>
  );
};

describe('useMouseInfluence', () => {
  describe('phase multipliers', () => {
    test.each([
      { phase: 'boot' as const, glow: 0.3, disruption: 0, pull: 0, repel: 0 },
      { phase: 'corruption' as const, glow: 0.5, disruption: 120, pull: 0, repel: 0 },
      { phase: 'aftermath' as const, glow: 0.4, disruption: 0, pull: 0, repel: 150 },
    ])('$phase phase returns correct multipliers', async ({ phase, glow, disruption, pull, repel }) => {
      await render(<TestComponent phase={phase} />);

      await expect.element(page.getByTestId('glow-intensity')).toHaveTextContent(glow.toFixed(2));
      await expect.element(page.getByTestId('disruption-radius')).toHaveTextContent(String(disruption));
      await expect.element(page.getByTestId('pull-strength')).toHaveTextContent(String(pull));
      await expect.element(page.getByTestId('repel-force')).toHaveTextContent(String(repel));
    });
  });

  describe('position tracking', () => {
    test('updates position on mouse move', async () => {
      await render(<TestComponent phase='boot' />);

      // Move mouse using native event
      globalThis.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 200 }));

      // Position should update
      await expect.element(page.getByTestId('position-x')).toHaveTextContent('100.00');
      await expect.element(page.getByTestId('position-y')).toHaveTextContent('200.00');
    });

    test('calculates normalized position in 0-1 range', async () => {
      await render(<TestComponent phase='boot' />);

      // Move to known position
      globalThis.dispatchEvent(new MouseEvent('mousemove', { clientX: 400, clientY: 300 }));

      // Get normalized values - wait for state update
      await expect
        .poll(() => {
          const normalizedX = Number.parseFloat(page.getByTestId('normalized-x').element().textContent);
          return normalizedX;
        })
        .toBeGreaterThan(0);

      const normalizedX = Number.parseFloat(page.getByTestId('normalized-x').element().textContent);
      const normalizedY = Number.parseFloat(page.getByTestId('normalized-y').element().textContent);

      // Should be between 0 and 1
      expect(normalizedX).toBeGreaterThanOrEqual(0);
      expect(normalizedX).toBeLessThanOrEqual(1);
      expect(normalizedY).toBeGreaterThanOrEqual(0);
      expect(normalizedY).toBeLessThanOrEqual(1);
    });

    test('does not track when disabled', async () => {
      await render(<TestComponent phase='boot' enabled={false} />);

      // Initial position should be 0,0
      await expect.element(page.getByTestId('position-x')).toHaveTextContent('0.00');
      await expect.element(page.getByTestId('position-y')).toHaveTextContent('0.00');

      // Move mouse
      globalThis.dispatchEvent(new MouseEvent('mousemove', { clientX: 500, clientY: 500 }));

      // Position should remain 0,0 (not tracking) - give a brief moment for potential update
      await expect.element(page.getByTestId('position-x')).toHaveTextContent('0.00');
      await expect.element(page.getByTestId('position-y')).toHaveTextContent('0.00');
    });

    test('initial normalized position is centered (0.5, 0.5)', async () => {
      await render(<TestComponent phase='boot' />);

      await expect.element(page.getByTestId('normalized-x')).toHaveTextContent('0.5000');
      await expect.element(page.getByTestId('normalized-y')).toHaveTextContent('0.5000');
    });
  });

  describe('velocity tracking', () => {
    test('initial velocity is zero', async () => {
      await render(<TestComponent phase='boot' />);

      await expect.element(page.getByTestId('velocity-x')).toHaveTextContent('0.00');
      await expect.element(page.getByTestId('velocity-y')).toHaveTextContent('0.00');
    });
  });
});
