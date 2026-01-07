import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import SkillCard from './SkillCard';
import { domainSkill, expertSkill, infrastructureSkill, learningSkill, proficientSkill, skillWithoutDescription } from './SkillCard.fixtures';

const meta = preview.meta({
  component: SkillCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    index: { control: 'number' },
  },
  decorators: [
    Story => (
      <div className='w-72'>
        <Story />
      </div>
    ),
  ],
});

export const Expert = meta.story({
  args: {
    skill: expertSkill,
    index: 0,
  },
  play: async context => {
    await testAllViewports(context);

    const canvas = within(context.canvasElement);
    await expect(canvas.getByText('TypeScript')).toBeInTheDocument();
    await expect(canvas.getByText('Expert')).toBeInTheDocument();
  },
});

export const Proficient = meta.story({
  args: {
    skill: proficientSkill,
    index: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Proficient')).toBeInTheDocument();
  },
});

export const Learning = meta.story({
  args: {
    skill: learningSkill,
    index: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Learning')).toBeInTheDocument();
  },
});

export const WithoutDescription = meta.story({
  args: {
    skill: skillWithoutDescription,
    index: 0,
  },
});

export const DomainSkill = meta.story({
  args: {
    skill: domainSkill,
    index: 0,
  },
});

export const InfrastructureSkill = meta.story({
  args: {
    skill: infrastructureSkill,
    index: 0,
  },
});

export const MultipleIndices = meta.story({
  render: () => (
    <div className='grid w-full max-w-4xl grid-cols-3 gap-4'>
      <SkillCard skill={expertSkill} index={0} />
      <SkillCard skill={proficientSkill} index={1} />
      <SkillCard skill={learningSkill} index={2} />
    </div>
  ),
});

export const AllLevels = meta.story({
  render: () => (
    <div className='flex flex-col gap-4'>
      <SkillCard skill={expertSkill} index={0} />
      <SkillCard skill={proficientSkill} index={0} />
      <SkillCard skill={learningSkill} index={0} />
    </div>
  ),
});
