import type { AISkill } from '#workflows/-utils/ai-skills-types';

import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { forceReducedMotion } from '../../../../../test/utils/disposable';

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
  describe('basic rendering', () => {
    test('renders canvas element', async () => {
      using _rm = forceReducedMotion();
      const { container } = await render(<SkillsVisualization />);

      const canvas = container.querySelector('canvas');
      expect(canvas).not.toBeNull();
    });

    test('renders with animate=true (default)', async () => {
      using _rm = forceReducedMotion();
      const { container } = await render(<SkillsVisualization />);

      const canvas = container.querySelector('canvas');
      expect(canvas).not.toBeNull();
    });

    test('renders with animate=false', async () => {
      using _rm = forceReducedMotion();
      const { container } = await render(<SkillsVisualization animate={false} />);

      const canvas = container.querySelector('canvas');
      expect(canvas).not.toBeNull();
    });

    test('renders legend with skill levels', async () => {
      using _rm = forceReducedMotion();
      const { container } = await render(<SkillsVisualization />);

      // Check for legend items
      const legend = container.querySelector('.absolute.bottom-4.left-4');
      expect(legend).not.toBeNull();
    });

    test('draws nodes for skills', async () => {
      using _rm = forceReducedMotion();
      const { container } = await render(<SkillsVisualization />);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      expect(canvas).not.toBeNull();

      // Canvas should have valid dimensions
      expect(canvas.width).toBeGreaterThan(0);
    });
  });

  describe('reduced motion', () => {
    test('handles reduced motion preference', async () => {
      using _rm = forceReducedMotion();
      // Mock reduced motion preference
      using _matchMedia = vi.spyOn(globalThis, 'matchMedia').mockImplementation(query => ({
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
    });
  });

  describe('cleanup', () => {
    test('cleans up on unmount', async () => {
      using _rm = forceReducedMotion();
      using cancelAnimationFrameSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');

      const screen = await render(<SkillsVisualization animate />);

      await screen.unmount();

      // ResizeObserver disconnect is called internally, cancelAnimationFrame for animation cleanup
      // oxlint-disable-next-line vitest/prefer-called-with
      expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    });
  });

  describe('aI skills', () => {
    test('accepts aiSkills prop array', async () => {
      using _rm = forceReducedMotion();
      const { container } = await render(<SkillsVisualization aiSkills={mockAISkills} />);

      const canvas = container.querySelector('canvas');
      expect(canvas).not.toBeNull();
    });

    test('renders AI discovered legend when aiSkills with is_ai_discovered=true are provided', async () => {
      using _rm = forceReducedMotion();
      await render(<SkillsVisualization aiSkills={mockAISkills} />);

      // Should show "AI発見" legend item
      await expect.element(page.getByText('AI発見')).toBeInTheDocument();
    });

    test('does not show AI legend when no AI-discovered skills', async () => {
      using _rm = forceReducedMotion();
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
      using _rm = forceReducedMotion();
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
      using _rm = forceReducedMotion();
      const { container } = await render(<SkillsVisualization selectedSkillId='TypeScript' />);

      const canvas = container.querySelector('canvas');
      expect(canvas).not.toBeNull();
    });

    test('canvas still selects nodes on click', async () => {
      using _rm = forceReducedMotion();
      const onNodeSelect = vi.fn();

      const { container } = await render(<SkillsVisualization selectedSkillId='TypeScript' onNodeSelect={onNodeSelect} />);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      expect(canvas).not.toBeNull();

      // Clicking empty space still deselects for sighted mouse users
      canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 10, clientY: 10 }));

      expect(onNodeSelect).toHaveBeenCalledWith(null);
    });
  });

  describe('accessibility', () => {
    test('canvas is exposed as an image with a Japanese label', async () => {
      using _rm = forceReducedMotion();
      const { container } = await render(<SkillsVisualization />);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      expect(canvas.getAttribute('role')).toBe('img');
      expect(canvas.getAttribute('aria-label')).toBe('スキルの関係性を示すネットワーク図。各スキルは下のスキル一覧から選択できます。');
    });

    test('canvas is not a keyboard focus trap (no tabindex / application role)', async () => {
      using _rm = forceReducedMotion();
      const { container } = await render(<SkillsVisualization />);

      // role='application' + tabIndex trapped screen readers in an opaque canvas.
      // Keyboard selection is provided by the skill grid buttons instead.
      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      expect(canvas.getAttribute('role')).not.toBe('application');
      expect(canvas.hasAttribute('tabindex')).toBe(false);
    });
  });
});
