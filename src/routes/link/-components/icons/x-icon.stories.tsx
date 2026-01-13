import { expect } from 'storybook/test';

import preview from '#.storybook/preview';

import XIcon from './x-icon';

const meta = preview.meta({
  component: XIcon,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    Story => (
      <div className='bg-muted rounded-lg p-8'>
        <Story />
      </div>
    ),
  ],
});

export const Default = meta.story({
  args: { className: 'size-8' },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg');
    await expect(svg).toHaveAttribute('aria-hidden', 'true');
    await expect(svg).toHaveAttribute('viewBox');
    await expect(svg?.querySelector('path')).toHaveAttribute('fill', '#ffffff');
  },
});
