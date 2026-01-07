import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import CurrentTime from './CurrentTime';

const meta = preview.meta({
  component: CurrentTime,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
});

export const Default = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Time format should be HH:MM:SS or --:--:--
    const timeElement = canvas.getByText(/\d{2}:\d{2}:\d{2}|--:--:--/);
    await expect(timeElement).toBeInTheDocument();
    await expect(timeElement).toHaveClass('font-mono');
  },
});

export const Static = meta.story({
  args: { fixedTime: '12:34:56' },
  play: async context => {
    await testAllViewports(context);
  },
});
