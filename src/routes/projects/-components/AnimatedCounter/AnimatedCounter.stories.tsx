import preview from '#.storybook/preview';

import AnimatedCounter from './AnimatedCounter';

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
      <div className='rounded border border-line bg-surface p-8'>
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
    <div className='flex flex-col gap-4 rounded border border-line bg-surface p-8'>
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
