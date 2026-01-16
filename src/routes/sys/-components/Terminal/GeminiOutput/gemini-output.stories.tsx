import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import GeminiOutput from './gemini-output';

const meta = preview.meta({
  component: GeminiOutput,
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
 * Login mode - shown when running `gemini` with no args
 */
export const Login = meta.story({
  args: { mode: 'login' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Google account required/)).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: /Continue at gemini.google.com/ })).toBeInTheDocument();
  },
});

/**
 * Help mode - shown when running `gemini --help`
 */
export const Help = meta.story({
  args: { mode: 'help' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/gemini - Google/)).toBeInTheDocument();
    await expect(canvas.getByText(/Usage:/)).toBeInTheDocument();
    await expect(canvas.getByText(/about/)).toBeInTheDocument();
    await expect(canvas.getByText(/philosophy/)).toBeInTheDocument();
  },
});

/**
 * Version mode - shown when running `gemini --version`
 */
export const Version = meta.story({
  args: { mode: 'version' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('gemini')).toBeInTheDocument();
    await expect(canvas.getByText(/gemini-2/)).toBeInTheDocument();
  },
});

/**
 * About mode - shown when running `gemini about`
 */
export const About = meta.story({
  args: { mode: 'about' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Model:')).toBeInTheDocument();
    await expect(canvas.getByText('Gemini 2.5 Pro')).toBeInTheDocument();
    await expect(canvas.getByText('Google DeepMind')).toBeInTheDocument();
  },
});

/**
 * Philosophy mode - shown when running `gemini philosophy`
 */
export const Philosophy = meta.story({
  args: { mode: 'philosophy' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/I am Gemini/)).toBeInTheDocument();
    await expect(canvas.getByText(/intelligent engineering/)).toBeInTheDocument();
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
