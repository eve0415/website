import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';

import StatsPanel from './StatsPanel';
import { emptyStats, highActivityStats, lowActivityStats, sampleStats } from './StatsPanel.fixtures';

const meta = preview.meta({
  component: StatsPanel,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    animate: { control: 'boolean' },
  },
  decorators: [
    Story => (
      <div className='bg-bg-primary p-8'>
        <Story />
      </div>
    ),
  ],
});

export const Default = meta.story({
  args: {
    stats: sampleStats,
    animate: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('REPO_STATUS')).toBeInTheDocument();
    await expect(canvas.getByText('CONTRIBUTION_LOG')).toBeInTheDocument();
    await expect(canvas.getByText('STREAK_DATA')).toBeInTheDocument();
  },
});

export const Animated = meta.story({
  args: {
    stats: sampleStats,
    animate: true,
  },
});

export const Static = meta.story({
  args: {
    stats: sampleStats,
    animate: false,
  },
});

export const LowActivity = meta.story({
  args: {
    stats: lowActivityStats,
    animate: false,
  },
});

export const HighActivity = meta.story({
  args: {
    stats: highActivityStats,
    animate: false,
  },
});

export const Empty = meta.story({
  args: {
    stats: emptyStats,
    animate: false,
  },
});
