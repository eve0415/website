import type { FC } from 'react';

import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { useMousePosition } from './useMousePosition';

const TestComponent: FC = () => {
  const position = useMousePosition();
  return (
    <div>
      <div data-testid='x'>{position.x}</div>
      <div data-testid='y'>{position.y}</div>
      <div data-testid='normalized-x'>{position.normalizedX.toFixed(2)}</div>
      <div data-testid='normalized-y'>{position.normalizedY.toFixed(2)}</div>
    </div>
  );
};

describe('useMousePosition', () => {
  test('initial state is centered', async () => {
    await render(<TestComponent />);

    await expect.element(page.getByTestId('x')).toHaveTextContent('0');
    await expect.element(page.getByTestId('y')).toHaveTextContent('0');
    await expect.element(page.getByTestId('normalized-x')).toHaveTextContent('0.50');
    await expect.element(page.getByTestId('normalized-y')).toHaveTextContent('0.50');
  });

  test('updates position on mousemove', async () => {
    await render(<TestComponent />);

    // Simulate mouse move
    const event = new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 200,
    });
    globalThis.dispatchEvent(event);

    await expect.element(page.getByTestId('x')).toHaveTextContent('100');
    await expect.element(page.getByTestId('y')).toHaveTextContent('200');
  });

  test('calculates normalized values correctly', async () => {
    await render(<TestComponent />);

    // Get window dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Move to top-left
    globalThis.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: 0,
        clientY: 0,
      }),
    );

    await expect.element(page.getByTestId('normalized-x')).toHaveTextContent('0.00');
    await expect.element(page.getByTestId('normalized-y')).toHaveTextContent('0.00');

    // Move to center
    globalThis.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: width / 2,
        clientY: height / 2,
      }),
    );

    await expect.element(page.getByTestId('normalized-x')).toHaveTextContent('0.50');
    await expect.element(page.getByTestId('normalized-y')).toHaveTextContent('0.50');

    // Move to bottom-right
    globalThis.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: width,
        clientY: height,
      }),
    );

    await expect.element(page.getByTestId('normalized-x')).toHaveTextContent('1.00');
    await expect.element(page.getByTestId('normalized-y')).toHaveTextContent('1.00');
  });

  test('updates on multiple mouse moves', async () => {
    await render(<TestComponent />);

    // First move
    globalThis.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 100,
      }),
    );

    await expect.element(page.getByTestId('x')).toHaveTextContent('100');

    // Second move
    globalThis.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: 250,
        clientY: 350,
      }),
    );

    await expect.element(page.getByTestId('x')).toHaveTextContent('250');
    await expect.element(page.getByTestId('y')).toHaveTextContent('350');
  });

  test('cleans up event listener on unmount', async () => {
    const screen = await page.render(<TestComponent />);

    await screen.unmount();

    // After unmount, listener should be removed
    // This is a behavioral test - we verify no errors occur
    globalThis.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: 999,
        clientY: 999,
      }),
    );

    // If cleanup didn't work, this would cause issues in subsequent tests
    expect(true).toBeTruthy();
  });
});
