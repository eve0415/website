import preview from '#.storybook/preview';

import SkillsVisualization from './SkillsVisualization';

const meta = preview.meta({
  component: SkillsVisualization,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <div className='flex h-screen w-full items-center justify-center bg-bg-primary p-8'>
        <div className='w-full max-w-2xl'>
          <Story />
        </div>
      </div>
    ),
  ],
});

export const Default = meta.story({});
