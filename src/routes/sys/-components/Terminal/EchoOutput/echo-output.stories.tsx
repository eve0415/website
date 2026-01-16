import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import EchoOutput from './echo-output';

const meta = preview.meta({
  component: EchoOutput,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    Story => (
      <div className='border-line bg-bg-primary max-w-md rounded border p-6'>
        <Story />
      </div>
    ),
  ],
});

/**
 * Default echo output with sample text
 */
export const Default = meta.story({
  args: { text: 'hello world' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('hello world')).toBeInTheDocument();
  },
});

/**
 * Empty text output
 */
export const Empty = meta.story({
  args: { text: '' },
  play: async ({ canvasElement }) => {
    // Empty text renders an empty div
    await expect(canvasElement.querySelector('.font-mono')).toBeInTheDocument();
  },
});

/**
 * Long text that wraps
 */
export const LongText = meta.story({
  args: { text: 'This is a longer piece of text that demonstrates how the echo output handles wrapping when the content exceeds the container width.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/This is a longer/)).toBeInTheDocument();
  },
});

/**
 * Static version for visual regression testing across viewports
 */
export const Static = meta.story({
  args: { text: 'hello world' },
  play: async context => {
    await testAllViewports(context);

    const canvas = within(context.canvasElement);
    await expect(canvas.getByText('hello world')).toBeInTheDocument();
  },
});
