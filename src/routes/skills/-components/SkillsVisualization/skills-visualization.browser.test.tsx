import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import SkillsVisualization from './skills-visualization';

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

  test('cleans up on unmount', async () => {
    const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');

    const screen = await render(<SkillsVisualization animate={true} />);

    await screen.unmount();

    // ResizeObserver disconnect is called internally, cancelAnimationFrame for animation cleanup
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();

    cancelAnimationFrameSpy.mockRestore();
  });

  test('draws nodes for skills', async () => {
    const { container } = await render(<SkillsVisualization />);

    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).not.toBeNull();

    // Canvas should have valid dimensions
    expect(canvas.width).toBeGreaterThan(0);
  });
});
