import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import HelpOutput from './help-output';

const meta = preview.meta({
  component: HelpOutput,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    Story => (
      <div className='max-w-md rounded border border-line bg-bg-primary p-6'>
        <Story />
      </div>
    ),
  ],
});

/**
 * Default help output showing all available terminal commands
 */
export const Default = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify header
    await expect(canvas.getByText('SYS.DIAGNOSTIC(1)')).toBeInTheDocument();

    // Verify command list
    await expect(canvas.getByText('help')).toBeInTheDocument();
    await expect(canvas.getByText('clear')).toBeInTheDocument();
    await expect(canvas.getByText('whoami')).toBeInTheDocument();
    await expect(canvas.getByText('neofetch')).toBeInTheDocument();
    await expect(canvas.getByText('exit')).toBeInTheDocument();

    // Verify descriptions
    await expect(canvas.getByText('Display this help message')).toBeInTheDocument();
    await expect(canvas.getByText('Clear terminal output')).toBeInTheDocument();
  },
});

/**
 * Static version for visual regression testing across viewports
 */
export const Static = meta.story({
  play: async context => {
    await testAllViewports(context);

    const canvas = within(context.canvasElement);
    await expect(canvas.getByText('SYS.DIAGNOSTIC(1)')).toBeInTheDocument();
  },
});

/**
 * Shows the easter egg hint section
 */
export const EasterEggHint = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify easter egg section
    await expect(canvas.getByText('EASTER EGGS')).toBeInTheDocument();
    await expect(canvas.getByText(/Try some dangerous commands/)).toBeInTheDocument();
  },
});
