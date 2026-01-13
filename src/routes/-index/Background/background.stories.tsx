import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import Background from './background';

const meta = preview.meta({
  component: Background,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <div className='bg-bg-primary relative h-screen w-screen'>
        <Story />
        <div className='absolute inset-0 flex items-center justify-center'>
          <span className='bg-surface text-foreground rounded px-4 py-2 font-mono'>Move mouse to see reactive grid dots</span>
        </div>
      </div>
    ),
  ],
});

export const Default = meta.story({});

export const Static = meta.story({
  play: async context => {
    await testAllViewports(context);
  },
});
