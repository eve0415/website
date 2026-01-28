import { expect, fn, within } from 'storybook/test';

import preview from '#.storybook/preview';

import AISkillPanel from './ai-skill-panel';
import { aiDiscoveredSkill, expertSkill, learningSkill, proficientSkill, skillWithNoEvidence } from './ai-skill-panel.fixtures';

const meta = preview.meta({
  component: AISkillPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    // Disable a11y checks - component has intentional color choices for dark theme
    a11y: { disable: true },
  },
  argTypes: {
    isExpanded: { control: 'boolean' },
    onClose: { action: 'onClose' },
  },
  decorators: [
    Story => {
      // Force reduced motion to skip animations in tests
      globalThis.__FORCE_REDUCED_MOTION__ = true;
      return (
        <div className='bg-bg-primary relative h-screen w-full'>
          <Story />
        </div>
      );
    },
  ],
});

export const ExpertSkill = meta.story({
  args: {
    skill: expertSkill,
    isExpanded: true,
    onClose: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('TypeScript')).toBeInTheDocument();
    await expect(canvas.getByText('Expert')).toBeInTheDocument();
    await expect(canvas.getByText('↑ 上昇中')).toBeInTheDocument();
    await expect(canvas.getByText('信頼度: 95%')).toBeInTheDocument();
  },
});

export const ProficientSkill = meta.story({
  args: {
    skill: proficientSkill,
    isExpanded: true,
    onClose: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Kubernetes')).toBeInTheDocument();
    await expect(canvas.getByText('Proficient')).toBeInTheDocument();
    await expect(canvas.getByText('→ 安定')).toBeInTheDocument();
  },
});

export const LearningSkill = meta.story({
  args: {
    skill: learningSkill,
    isExpanded: true,
    onClose: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Rust')).toBeInTheDocument();
    await expect(canvas.getByText('Learning')).toBeInTheDocument();
    await expect(canvas.getByText('↓ 低下傾向')).toBeInTheDocument();
  },
});

export const NoEvidence = meta.story({
  args: {
    skill: skillWithNoEvidence,
    isExpanded: true,
    onClose: fn(),
  },
  play: async ({ canvasElement: _canvasElement }) => {},
});

export const AIDiscoveredBadge = meta.story({
  args: {
    skill: aiDiscoveredSkill,
    isExpanded: true,
    onClose: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('GraphQL')).toBeInTheDocument();
    await expect(canvas.getByText('✨ AI発見')).toBeInTheDocument();
  },
});

export const Collapsed = meta.story({
  args: {
    skill: expertSkill,
    isExpanded: false,
    onClose: fn(),
  },
  play: async ({ canvasElement: _canvasElement }) => {},
});
