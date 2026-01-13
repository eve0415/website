import { expect, waitFor, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import AnimatedCounter from './animated-counter';

const meta = preview.meta({
  component: AnimatedCounter,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    end: { control: 'number' },
    duration: { control: 'number' },
    suffix: { control: 'text' },
  },
  decorators: [
    Story => (
      <div className='border-line bg-surface rounded border p-8'>
        <Story />
      </div>
    ),
  ],
});

export const Default = meta.story({
  args: {
    end: 100,
    duration: 2000,
  },
});

export const Static = meta.story({
  args: {
    end: 100,
    duration: 0,
  },
  play: async context => {
    const canvas = within(context.canvasElement);
    // Wait for IntersectionObserver to trigger and value to appear
    // duration=0 means instant animation once visible
    await waitFor(() => expect(canvas.getByText('100')).toBeInTheDocument(), { timeout: 10000 });
    await testAllViewports(context);
  },
});

export const WithSuffix = meta.story({
  args: {
    end: 85,
    duration: 2000,
    suffix: '%',
  },
});

export const LongDuration = meta.story({
  args: {
    end: 500,
    duration: 3000,
  },
});

export const ShortDuration = meta.story({
  args: {
    end: 50,
    duration: 500,
  },
});

export const LargeNumber = meta.story({
  args: {
    end: 12500,
    duration: 2000,
    suffix: '+',
  },
});

export const MultipleCounters = meta.story({
  render: () => (
    <div className='border-line bg-surface flex flex-col gap-4 rounded border p-8'>
      <div className='flex items-center justify-between'>
        <span className='text-muted-foreground'>Downloads</span>
        <AnimatedCounter end={795000} duration={2500} suffix='+' />
      </div>
      <div className='flex items-center justify-between'>
        <span className='text-muted-foreground'>Stars</span>
        <AnimatedCounter end={1234} duration={2000} />
      </div>
      <div className='flex items-center justify-between'>
        <span className='text-muted-foreground'>Forks</span>
        <AnimatedCounter end={89} duration={1500} />
      </div>
    </div>
  ),
});
