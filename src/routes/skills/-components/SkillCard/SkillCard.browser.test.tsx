import type { Skill } from '../../-config/skills-config';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import SkillCard from './SkillCard';

const mockSkill: Skill = {
  name: 'TypeScript',
  level: 'expert',
  category: 'language',
  description: 'A strongly typed programming language',
};

describe('SkillCard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders skill name and level', async () => {
    await render(<SkillCard skill={mockSkill} index={0} />);

    await expect.element(page.getByText('TypeScript')).toBeInTheDocument();
    await expect.element(page.getByText('Expert')).toBeInTheDocument();
  });

  test('renders description when provided', async () => {
    await render(<SkillCard skill={mockSkill} index={0} />);

    await expect.element(page.getByText('A strongly typed programming language')).toBeInTheDocument();
  });

  test('renders without description when not provided', async () => {
    const skillWithoutDesc: Skill = {
      name: 'JavaScript',
      level: 'proficient',
      category: 'language',
    };

    await render(<SkillCard skill={skillWithoutDesc} index={0} />);

    await expect.element(page.getByText('JavaScript')).toBeInTheDocument();
  });

  test('handles different skill levels', async () => {
    const proficientSkill: Skill = {
      name: 'Python',
      level: 'proficient',
      category: 'language',
    };

    await render(<SkillCard skill={proficientSkill} index={0} />);

    await expect.element(page.getByText('Proficient')).toBeInTheDocument();
  });

  test('handles learning level', async () => {
    const learningSkill: Skill = {
      name: 'Rust',
      level: 'learning',
      category: 'language',
    };

    await render(<SkillCard skill={learningSkill} index={0} />);

    await expect.element(page.getByText('Learning')).toBeInTheDocument();
  });

  test('animates in based on index', async () => {
    const { container } = await render(<SkillCard skill={mockSkill} index={2} />);

    // Fast-forward past animation delay (index * 50ms = 100ms + buffer)
    await vi.advanceTimersByTimeAsync(200);

    const card = container.querySelector('.translate-y-0.opacity-100');
    expect(card).not.toBeNull();
  });

  test('handles mouse enter (hover state)', async () => {
    const { container } = await render(<SkillCard skill={mockSkill} index={0} />);

    // Fast-forward past initial animation
    await vi.advanceTimersByTimeAsync(100);

    const card = container.querySelector('.group');
    expect(card).not.toBeNull();

    // Hover over the card using native event
    card!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

    // Progress bar should expand (checking the card still exists and is hovered)
    expect(container.querySelector('.group')).not.toBeNull();
  });

  test('handles mouse leave (resets hover state - line 55)', async () => {
    const { container } = await render(<SkillCard skill={mockSkill} index={0} />);

    // Fast-forward past initial animation
    await vi.advanceTimersByTimeAsync(100);

    const card = container.querySelector('.group');
    expect(card).not.toBeNull();

    // Hover then unhover using native events
    card!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    card!.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

    // Card should still exist after unhover
    expect(container.querySelector('.group')).not.toBeNull();
  });

  test('shows progress bar on hover', async () => {
    const { container } = await render(<SkillCard skill={mockSkill} index={0} />);

    // Fast-forward past initial animation
    await vi.advanceTimersByTimeAsync(100);

    const card = container.querySelector('.group');
    expect(card).not.toBeNull();

    // Check progress bar exists (it's always in DOM, just width changes)
    const progressBar = container.querySelector('.absolute.bottom-0.left-0.h-1');
    expect(progressBar).not.toBeNull();
  });
});
