import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import StatRow from './stat-row';

const meta = preview.meta({
  component: StatRow,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
    },
    animate: { control: 'boolean' },
    delay: { control: 'number' },
  },
  decorators: [
    Story => (
      <div className='w-80 rounded border border-line bg-surface/50 px-4'>
        <Story />
      </div>
    ),
  ],
});

export const Primary = meta.story({
  args: {
    label: 'COMMITS',
    value: 1234,
    delay: 0,
    animate: false,
    color: 'primary',
  },
});

export const Secondary = meta.story({
  args: {
    label: 'PR_MERGED',
    value: 567,
    delay: 0,
    animate: false,
    color: 'secondary',
  },
});

export const Tertiary = meta.story({
  args: {
    label: 'ISSUES',
    value: 89,
    delay: 0,
    animate: false,
    color: 'tertiary',
  },
});

export const WithSuffix = meta.story({
  args: {
    label: 'CURRENT_STREAK',
    value: 42,
    suffix: 'days',
    delay: 0,
    animate: false,
    color: 'primary',
  },
});

export const Animated = meta.story({
  args: {
    label: 'TOTAL_REPOS',
    value: 100,
    delay: 0,
    animate: true,
    color: 'primary',
  },
});

export const Static = meta.story({
  args: {
    label: 'PUBLIC',
    value: 75,
    delay: 0,
    animate: false,
    color: 'secondary',
  },
  play: async context => {
    await testAllViewports(context);
  },
});

export const AllColors = meta.story({
  render: () => (
    <div className='w-80 rounded border border-line bg-surface/50 px-4'>
      <StatRow label='PRIMARY' value={100} delay={0} animate={false} color='primary' />
      <StatRow label='SECONDARY' value={200} delay={0} animate={false} color='secondary' />
      <StatRow label='TERTIARY' value={300} delay={0} animate={false} color='tertiary' />
    </div>
  ),
});
