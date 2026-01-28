import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import AISkillPanel from './ai-skill-panel';
import { aiDiscoveredSkill, expertSkill, learningSkill, proficientSkill, skillWithNoEvidence } from './ai-skill-panel.fixtures';

describe('aISkillPanel', () => {
  beforeEach(() => {
    // Force reduced motion for predictable, instant state in tests
    globalThis.__FORCE_REDUCED_MOTION__ = true;
  });

  afterEach(() => {
    globalThis.__FORCE_REDUCED_MOTION__ = undefined;
  });

  describe('visibility', () => {
    test('renders panel when isExpanded=true', async () => {
      const { container } = await render(<AISkillPanel skill={expertSkill} isExpanded onClose={vi.fn()} />);

      // Panel should be rendered with fixed positioning
      expect(container.querySelector('.fixed')).not.toBeNull();
      // Skill name should be in the content
      expect(container.textContent).toContain('TypeScript');
    });

    test('returns null when isExpanded=false', async () => {
      const { container } = await render(<AISkillPanel skill={expertSkill} isExpanded={false} onClose={vi.fn()} />);

      // Panel should not be rendered
      expect(container.querySelector('.fixed')).toBeNull();
    });
  });

  describe('close button', () => {
    test('calls onClose when clicked', async () => {
      const onClose = vi.fn();

      await render(<AISkillPanel skill={expertSkill} isExpanded onClose={onClose} />);

      const closeButton = page.getByRole('button', { name: '閉じる' });
      await closeButton.click();

      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  describe('level labels', () => {
    test('renders Expert label for expert level', async () => {
      await render(<AISkillPanel skill={expertSkill} isExpanded onClose={vi.fn()} />);

      await expect.element(page.getByText('Expert')).toBeInTheDocument();
    });

    test('renders Proficient label for proficient level', async () => {
      await render(<AISkillPanel skill={proficientSkill} isExpanded onClose={vi.fn()} />);

      await expect.element(page.getByText('Proficient')).toBeInTheDocument();
    });

    test('renders Learning label for learning level', async () => {
      await render(<AISkillPanel skill={learningSkill} isExpanded onClose={vi.fn()} />);

      await expect.element(page.getByText('Learning')).toBeInTheDocument();
    });
  });

  describe('trend labels', () => {
    test('renders rising trend label', async () => {
      await render(<AISkillPanel skill={expertSkill} isExpanded onClose={vi.fn()} />);

      await expect.element(page.getByText('↑ 上昇中')).toBeInTheDocument();
    });

    test('renders stable trend label', async () => {
      await render(<AISkillPanel skill={proficientSkill} isExpanded onClose={vi.fn()} />);

      await expect.element(page.getByText('→ 安定')).toBeInTheDocument();
    });

    test('renders declining trend label', async () => {
      await render(<AISkillPanel skill={learningSkill} isExpanded onClose={vi.fn()} />);

      await expect.element(page.getByText('↓ 低下傾向')).toBeInTheDocument();
    });
  });

  describe('confidence', () => {
    test('renders confidence percentage', async () => {
      await render(<AISkillPanel skill={expertSkill} isExpanded onClose={vi.fn()} />);

      // 0.95 * 100 = 95%
      await expect.element(page.getByText('信頼度: 95%')).toBeInTheDocument();
    });
  });

  describe('category', () => {
    test('renders category badge', async () => {
      await render(<AISkillPanel skill={expertSkill} isExpanded onClose={vi.fn()} />);

      await expect.element(page.getByText('language')).toBeInTheDocument();
    });
  });

  describe('evidence list', () => {
    test('renders evidence items', async () => {
      await render(<AISkillPanel skill={expertSkill} isExpanded onClose={vi.fn()} />);

      await expect.element(page.getByText('Evidence')).toBeInTheDocument();
      await expect.element(page.getByText('100+ commits with strict TypeScript')).toBeInTheDocument();
      await expect.element(page.getByText('Type-safe API designs')).toBeInTheDocument();
      await expect.element(page.getByText('Complex generic patterns')).toBeInTheDocument();
    });

    test('does not render evidence section when empty', async () => {
      const { container } = await render(<AISkillPanel skill={skillWithNoEvidence} isExpanded onClose={vi.fn()} />);

      // Should not have Evidence heading
      const evidenceSection = container.querySelector('h4');
      expect(evidenceSection).toBeNull();
    });
  });

  describe('aI badge', () => {
    test('shows AI badge when is_ai_discovered=true', async () => {
      await render(<AISkillPanel skill={aiDiscoveredSkill} isExpanded onClose={vi.fn()} />);

      await expect.element(page.getByText('✨ AI発見')).toBeInTheDocument();
    });

    test('does not show AI badge when is_ai_discovered=false', async () => {
      const { container } = await render(<AISkillPanel skill={expertSkill} isExpanded onClose={vi.fn()} />);

      // expertSkill has is_ai_discovered=false
      const aiBadge = container.querySelector('.ai-shimmer-border');
      expect(aiBadge).toBeNull();
    });
  });

  describe('typewriter description', () => {
    test('final text matches skill.description_ja with reduced motion', async () => {
      // __FORCE_REDUCED_MOTION__ already set in beforeEach
      await render(<AISkillPanel skill={expertSkill} isExpanded onClose={vi.fn()} />);

      // With reduced motion, description should show immediately
      await expect.element(page.getByText(expertSkill.description_ja)).toBeInTheDocument();
    });

    test('skip button not shown when reduced motion enabled', async () => {
      // __FORCE_REDUCED_MOTION__ already set - animation completes instantly
      const { container } = await render(<AISkillPanel skill={expertSkill} isExpanded onClose={vi.fn()} />);

      // Skip button should NOT be visible (animation already complete)
      expect(container.textContent).not.toContain('[Skip]');
    });
  });
});
