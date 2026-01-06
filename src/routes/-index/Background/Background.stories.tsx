import preview from '#.storybook/preview';

import Background from './Background';

const meta = preview.meta({
  component: Background,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <div className='relative h-screen w-screen bg-bg-primary'>
        <Story />
        <div className='absolute inset-0 flex items-center justify-center'>
          <span className='rounded bg-surface px-4 py-2 font-mono text-foreground'>Move mouse to see reactive grid dots</span>
        </div>
      </div>
    ),
  ],
});

export const Default = meta.story({});
