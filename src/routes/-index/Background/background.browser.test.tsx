import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import Background from './background';

describe('background', () => {
  test('renders canvas element', async () => {
    const { container } = await render(<Background />);

    // Canvas should be rendered (aria-hidden elements don't have presentation role)
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  test('canvas has correct attributes', async () => {
    const { container } = await render(<Background />);

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
    expect(canvas).toHaveClass('pointer-events-none');
  });

  test('responds to window resize', async () => {
    const { container } = await render(<Background />);

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();

    // Trigger resize
    globalThis.dispatchEvent(new Event('resize'));

    // Canvas should still exist after resize
    expect(container.querySelector('canvas')).not.toBeNull();
  });

  test('cleans up on unmount', async () => {
    const removeEventListenerSpy = vi.spyOn(globalThis, 'removeEventListener');
    const cancelAnimationFrameSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');

    const screen = await render(<Background />);

    await screen.unmount();

    // Cleanup should remove resize listener
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    // And cancel animation frame
    // oxlint-disable-next-line vitest(prefer-called-with) -- toHaveBeenCalled() is correct; we only care that it was called
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();

    removeEventListenerSpy.mockRestore();
    cancelAnimationFrameSpy.mockRestore();
  });

  test('handles reduced motion preference', async () => {
    // Mock reduced motion preference
    const originalMatchMedia = globalThis.matchMedia;
    vi.spyOn(globalThis, 'matchMedia').mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = await render(<Background />);

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();

    // Restore
    globalThis.matchMedia = originalMatchMedia;
  });

  test('handles mouse movement', async () => {
    const { container } = await render(<Background />);

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();

    // Dispatch mouse move event
    globalThis.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 200 }));

    // Animation should continue (canvas still exists)
    expect(container.querySelector('canvas')).not.toBeNull();
  });
});
