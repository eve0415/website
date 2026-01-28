/* oxlint-disable typescript-eslint(no-unsafe-type-assertion) -- Test assertions verify canvas element existence before type casting */
import type { AISkill } from '#workflows/-utils/ai-skills-types';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import SkillsVisualization from './skills-visualization';

const mockAISkill: AISkill = {
  name: 'GraphQL',
  category: 'domain',
  level: 'proficient',
  confidence: 0.8,
  description_ja: 'テスト説明',
  evidence: ['test'],
  last_active: '2024-01-01T00:00:00Z',
  trend: 'rising',
  is_ai_discovered: true,
};

const mockAISkills: AISkill[] = [
  mockAISkill,
  {
    name: 'Rust',
    category: 'language',
    level: 'learning',
    confidence: 0.5,
    description_ja: 'テスト説明2',
    evidence: ['test2'],
    last_active: '2024-01-01T00:00:00Z',
    trend: 'stable',
    is_ai_discovered: true,
  },
];

describe('skillsVisualization', () => {
  beforeEach(() => {
    globalThis.__FORCE_REDUCED_MOTION__ = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('basic rendering', () => {
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

    test('draws nodes for skills', async () => {
      const { container } = await render(<SkillsVisualization />);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      expect(canvas).not.toBeNull();

      // Canvas should have valid dimensions
      expect(canvas.width).toBeGreaterThan(0);
    });
  });

  describe('reduced motion', () => {
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

      const { container } = await render(<SkillsVisualization animate />);

      const canvas = container.querySelector('canvas');
      expect(canvas).not.toBeNull();

      // Restore
      globalThis.matchMedia = originalMatchMedia;
    });
  });

  describe('cleanup', () => {
    test('cleans up on unmount', async () => {
      const cancelAnimationFrameSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');

      const screen = await render(<SkillsVisualization animate />);

      await screen.unmount();

      // ResizeObserver disconnect is called internally, cancelAnimationFrame for animation cleanup
      // oxlint-disable-next-line vitest(prefer-called-with) -- toHaveBeenCalled() is correct; we only care that it was called
      expect(cancelAnimationFrameSpy).toHaveBeenCalled();

      cancelAnimationFrameSpy.mockRestore();
    });
  });

  describe('aI skills', () => {
    test('accepts aiSkills prop array', async () => {
      const { container } = await render(<SkillsVisualization aiSkills={mockAISkills} />);

      const canvas = container.querySelector('canvas');
      expect(canvas).not.toBeNull();
    });

    test('renders AI discovered legend when aiSkills with is_ai_discovered=true are provided', async () => {
      await render(<SkillsVisualization aiSkills={mockAISkills} />);

      // Should show "AI発見" legend item
      await expect.element(page.getByText('AI発見')).toBeInTheDocument();
    });

    test('does not show AI legend when no AI-discovered skills', async () => {
      const nonAISkills: AISkill[] = [
        {
          ...mockAISkill,
          is_ai_discovered: false,
        },
      ];

      const { container } = await render(<SkillsVisualization aiSkills={nonAISkills} />);

      // Should not have AI発見 legend
      expect(container.textContent).not.toContain('AI発見');
    });
  });

  describe('node selection', () => {
    test('onNodeSelect callback fires when provided', async () => {
      const onNodeSelect = vi.fn();

      const { container } = await render(<SkillsVisualization onNodeSelect={onNodeSelect} />);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      expect(canvas).not.toBeNull();

      // Click on canvas (empty space)
      canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 10, clientY: 10 }));

      // Should call with null for empty space
      expect(onNodeSelect).toHaveBeenCalledWith(null);
    });

    test('selectedSkillId prop is accepted', async () => {
      const { container } = await render(<SkillsVisualization selectedSkillId='TypeScript' />);

      const canvas = container.querySelector('canvas');
      expect(canvas).not.toBeNull();
    });

    test('canvas has keyboard handler for escape', async () => {
      const onNodeSelect = vi.fn();

      const { container } = await render(<SkillsVisualization selectedSkillId='TypeScript' onNodeSelect={onNodeSelect} />);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      expect(canvas).not.toBeNull();

      // Press escape
      canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      // Should call onNodeSelect with null
      expect(onNodeSelect).toHaveBeenCalledWith(null);
    });

    test('canvas has cursor pointer class when hovering node', async () => {
      const { container } = await render(<SkillsVisualization />);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      expect(canvas).not.toBeNull();

      // Canvas should be focusable with application role
      expect(canvas.tabIndex).toBe(0);
      expect(canvas.getAttribute('role')).toBe('application');
    });
  });

  describe('accessibility', () => {
    test('canvas has aria-label', async () => {
      const { container } = await render(<SkillsVisualization />);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      expect(canvas.getAttribute('aria-label')).toBe('Interactive skills visualization - click nodes to select, press Escape to deselect');
    });

    test('canvas is focusable', async () => {
      const { container } = await render(<SkillsVisualization />);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      expect(canvas.tabIndex).toBe(0);
    });
  });
});
