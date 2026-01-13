import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import WhoamiOutput from './whoami-output';

const meta = preview.meta({
  component: WhoamiOutput,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    login: { control: 'text' },
  },
  decorators: [
    Story => (
      <div className='border-line bg-bg-primary rounded border p-4'>
        <Story />
      </div>
    ),
  ],
});

/**
 * Default whoami output with eve0415 username
 */
export const Default = meta.story({
  args: {
    login: 'eve0415',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('eve0415')).toBeInTheDocument();
  },
});

/**
 * Static version for visual regression testing
 */
export const Static = meta.story({
  args: {
    login: 'eve0415',
  },
  play: async context => {
    await testAllViewports(context);

    const canvas = within(context.canvasElement);
    await expect(canvas.getByText('eve0415')).toBeInTheDocument();
  },
});

/**
 * Long username to test text overflow handling
 */
export const LongUsername = meta.story({
  args: {
    login: 'very-long-username-that-might-overflow',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('very-long-username-that-might-overflow')).toBeInTheDocument();
  },
});

/**
 * Short single-character username
 */
export const ShortUsername = meta.story({
  args: {
    login: 'x',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('x')).toBeInTheDocument();
  },
});
