import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import CodexOutput from './codex-output';

const meta = preview.meta({
  component: CodexOutput,
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
 * Login mode - shown when running `codex` with no args
 */
export const Login = meta.story({
  args: { mode: 'login' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('CODEX')).toBeInTheDocument();
    await expect(canvas.getByText(/API key required/)).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: /Get started at chatgpt.com/ })).toBeInTheDocument();
  },
});

/**
 * Help mode - shown when running `codex --help`
 */
export const Help = meta.story({
  args: { mode: 'help' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/codex - OpenAI/)).toBeInTheDocument();
    await expect(canvas.getByText(/Usage:/)).toBeInTheDocument();
    await expect(canvas.getByText(/about/)).toBeInTheDocument();
    await expect(canvas.getByText(/philosophy/)).toBeInTheDocument();
  },
});

/**
 * Version mode - shown when running `codex --version`
 */
export const Version = meta.story({
  args: { mode: 'version' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('codex')).toBeInTheDocument();
    await expect(canvas.getByText(/codex-1/)).toBeInTheDocument();
  },
});

/**
 * About mode - shown when running `codex about`
 */
export const About = meta.story({
  args: { mode: 'about' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('CODEX')).toBeInTheDocument();
    await expect(canvas.getByText('Model:')).toBeInTheDocument();
    await expect(canvas.getByText('GPT-4o')).toBeInTheDocument();
    await expect(canvas.getByText('OpenAI')).toBeInTheDocument();
  },
});

/**
 * Philosophy mode - shown when running `codex philosophy`
 */
export const Philosophy = meta.story({
  args: { mode: 'philosophy' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('CODEX')).toBeInTheDocument();
    await expect(canvas.getByText(/I am Codex/)).toBeInTheDocument();
    await expect(canvas.getByText(/Built to ship/)).toBeInTheDocument();
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
    await expect(canvas.getByText('CODEX')).toBeInTheDocument();
  },
});
