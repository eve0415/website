import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import SkillsVisualization from './SkillsVisualization';

describe('SkillsVisualization', () => {
  test('renders canvas element', async () => {
    const { container } = await render(<SkillsVisualization />);

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  test('renders with animate=true (default)', async () => {
    const { container } = await render(<SkillsVisualization />);

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();

    // Let animation run
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(container.querySelector('canvas')).not.toBeNull();
  });

  test('renders with animate=false', async () => {
    const { container } = await render(<SkillsVisualization animate={false} />);

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  test('renders legend with skill levels', async () => {
    const { container } = await render(<SkillsVisualization />);

    // Check for legend items
    const legend = container.querySelector('.absolute.bottom-4.left-4');
    expect(legend).not.toBeNull();
  });

  test('handles reduced motion preference', async () => {
    // Mock reduced motion preference
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = await render(<SkillsVisualization animate={true} />);

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();

    // Restore
    window.matchMedia = originalMatchMedia;
  });

  test('responds to window resize', async () => {
    const { container } = await render(<SkillsVisualization />);

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();

    // Trigger resize
    window.dispatchEvent(new Event('resize'));

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(container.querySelector('canvas')).not.toBeNull();
  });

  test('cleans up on unmount', async () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');

    const screen = await render(<SkillsVisualization animate={true} />);

    // Let animation start
    await new Promise(resolve => setTimeout(resolve, 50));

    await screen.unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();

    removeEventListenerSpy.mockRestore();
    cancelAnimationFrameSpy.mockRestore();
  });

  test('draws nodes for skills', async () => {
    const { container } = await render(<SkillsVisualization />);

    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).not.toBeNull();

    // Canvas should have valid dimensions
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(canvas.width).toBeGreaterThan(0);
  });
});
