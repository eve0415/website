import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import ClaudeOutput from './claude-output';

const meta = preview.meta({
  component: ClaudeOutput,
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
 * Login mode - shown when running `claude` with no args
 */
export const Login = meta.story({
  args: { mode: 'login' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Authentication required/)).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: /Sign in at claude.ai/ })).toBeInTheDocument();
  },
});

/**
 * Help mode - shown when running `claude --help`
 */
export const Help = meta.story({
  args: { mode: 'help' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/claude - Anthropic/)).toBeInTheDocument();
    await expect(canvas.getByText(/Usage:/)).toBeInTheDocument();
    await expect(canvas.getByText(/about/)).toBeInTheDocument();
    await expect(canvas.getByText(/philosophy/)).toBeInTheDocument();
  },
});

/**
 * Version mode - shown when running `claude --version`
 */
export const Version = meta.story({
  args: { mode: 'version' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('claude')).toBeInTheDocument();
    await expect(canvas.getByText(/claude-opus/)).toBeInTheDocument();
  },
});

/**
 * About mode - shown when running `claude about`
 */
export const About = meta.story({
  args: { mode: 'about' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Model:')).toBeInTheDocument();
    await expect(canvas.getByText('Claude Opus 4.5')).toBeInTheDocument();
    await expect(canvas.getByText('Context:')).toBeInTheDocument();
    await expect(canvas.getByText('Anthropic')).toBeInTheDocument();
  },
});

/**
 * Philosophy mode - shown when running `claude philosophy`
 */
export const Philosophy = meta.story({
  args: { mode: 'philosophy' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/I'm Claude, built by Anthropic/)).toBeInTheDocument();
    await expect(canvas.getByText(/Helpful, harmless, honest/)).toBeInTheDocument();
  },
});

/**
 * Static version for visual regression testing across viewports
 */
export const Static = meta.story({
  args: { mode: 'about' },
  play: async context => {
    await testAllViewports(context);

    const canvas = within(context.canvasElement);
    await expect(canvas.getByText('Model:')).toBeInTheDocument();
  },
});
