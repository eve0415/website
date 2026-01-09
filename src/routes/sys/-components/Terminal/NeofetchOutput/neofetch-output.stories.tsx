import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import { mockGitHubStats } from '../terminal.fixtures';

import NeofetchOutput from './neofetch-output';

const meta = preview.meta({
  component: NeofetchOutput,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    stats: { control: false },
  },
  decorators: [
    Story => (
      <div className='max-w-2xl rounded border border-line bg-bg-primary p-6'>
        <Story />
      </div>
    ),
  ],
});

/**
 * Default neofetch output with sample GitHub stats
 */
export const Default = meta.story({
  args: {
    stats: mockGitHubStats,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify ASCII logo is rendered (check for part of it)
    await expect(canvas.getByText(/███████╗/)).toBeInTheDocument();

    // Verify user info
    await expect(canvas.getByText('eve0415')).toBeInTheDocument();
    await expect(canvas.getByText('@')).toBeInTheDocument();
    await expect(canvas.getByText('sys')).toBeInTheDocument();

    // Verify system info labels
    await expect(canvas.getByText('OS:')).toBeInTheDocument();
    await expect(canvas.getByText('Host:')).toBeInTheDocument();
    await expect(canvas.getByText('Framework:')).toBeInTheDocument();
    await expect(canvas.getByText('Shell:')).toBeInTheDocument();

    // Verify stats
    await expect(canvas.getByText('Repos:')).toBeInTheDocument();
    await expect(canvas.getByText('Commits:')).toBeInTheDocument();
    await expect(canvas.getByText('Streak:')).toBeInTheDocument();
    await expect(canvas.getByText('Languages:')).toBeInTheDocument();
  },
});

/**
 * Static version for visual regression testing across viewports
 */
export const Static = meta.story({
  args: {
    stats: mockGitHubStats,
  },
  play: async context => {
    await testAllViewports(context);

    const canvas = within(context.canvasElement);
    await expect(canvas.getByText('eve0415')).toBeInTheDocument();
  },
});

/**
 * Shows repo and commit statistics
 */
export const StatsDisplay = meta.story({
  args: {
    stats: mockGitHubStats,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify repo counts
    await expect(canvas.getByText(/42 public, 10 private/)).toBeInTheDocument();

    // Verify commit count (1337 formatted with locale)
    await expect(canvas.getByText('1,337')).toBeInTheDocument();

    // Verify streak info
    await expect(canvas.getByText(/7 days \(max: 30\)/)).toBeInTheDocument();

    // Verify languages (top 5)
    await expect(canvas.getByText(/TypeScript, Rust, Go, Python, Other/)).toBeInTheDocument();
  },
});

/**
 * Shows the color palette at the bottom
 */
export const ColorPalette = meta.story({
  args: {
    stats: mockGitHubStats,
  },
  parameters: {
    docs: {
      description: {
        story: 'The neofetch output includes a color palette at the bottom, mimicking terminal color scheme displays.',
      },
    },
  },
});
