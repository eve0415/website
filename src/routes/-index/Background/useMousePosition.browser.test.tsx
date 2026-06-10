import type { MousePosition } from './useMousePosition';
import type { FC, RefObject } from 'react';

import { useEffect } from 'react';
import { describe, expect, test } from 'vite-plus/test';
import { render } from 'vitest-browser-react';

import { useMousePosition } from './useMousePosition';

// The hook stores position in a ref (no re-render on mousemove). Capture the
// ref and assert on its .current directly - clicking the DOM to force a render
// would dispatch its own pointer events and clobber the synthetic mousemove.
let captured: RefObject<MousePosition> | null = null;

const TestComponent: FC = () => {
  const ref = useMousePosition();
  useEffect(() => {
    captured = ref;
  }, [ref]);
  return null;
};

const move = (clientX: number, clientY: number) => {
  globalThis.dispatchEvent(new MouseEvent('mousemove', { clientX, clientY }));
};

describe('useMousePosition', () => {
  test('initial state is centered', async () => {
    await render(<TestComponent />);

    expect(captured?.current).toStrictEqual({ x: 0, y: 0, normalizedX: 0.5, normalizedY: 0.5 });
  });

  test('updates position on mousemove', async () => {
    await render(<TestComponent />);

    move(100, 200);

    await expect.poll(() => captured?.current.x).toBe(100);
    expect(captured?.current.y).toBe(200);
  });

  test('calculates normalized values correctly', async () => {
    await render(<TestComponent />);

    const width = window.innerWidth;
    const height = window.innerHeight;

    move(0, 0);
    await expect.poll(() => captured?.current.normalizedX).toBe(0);
    expect(captured?.current.normalizedY).toBe(0);

    move(width / 2, height / 2);
    await expect.poll(() => captured?.current.normalizedX).toBeCloseTo(0.5, 2);
    expect(captured?.current.normalizedY).toBeCloseTo(0.5, 2);

    move(width, height);
    await expect.poll(() => captured?.current.normalizedX).toBe(1);
    expect(captured?.current.normalizedY).toBe(1);
  });

  test('updates on multiple mouse moves', async () => {
    await render(<TestComponent />);

    move(100, 100);
    await expect.poll(() => captured?.current.x).toBe(100);

    move(250, 350);
    await expect.poll(() => captured?.current.x).toBe(250);
    expect(captured?.current.y).toBe(350);
  });

  test('cleans up event listener on unmount', async () => {
    const screen = await render(<TestComponent />);
    const ref = captured;
    await screen.unmount();

    // After unmount the listener is gone, so the ref no longer tracks moves
    move(999, 999);

    expect(ref?.current.x).not.toBe(999);
  });
});
