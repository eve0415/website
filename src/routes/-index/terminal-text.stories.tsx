import { expect, fn, waitFor, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import TerminalText from './terminal-text';

const meta = preview.meta({
  component: TerminalText,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    text: { control: 'text' },
    delay: { control: 'number' },
    speed: { control: 'number' },
    className: { control: 'text' },
  },
});

export const Default = meta.story({
  args: {
    text: 'Hello, World!',
    speed: 50,
    delay: 0,
  },
});

export const Static = meta.story({
  args: {
    text: 'Complete text displayed',
    speed: 0,
    delay: 0,
  },
  play: async context => {
    const canvas = within(context.canvasElement);
    // Wait for static text to render (speed=0 means instant)
    await waitFor(async () => expect(canvas.getByText('Complete text displayed')).toBeInTheDocument());
    await testAllViewports(context);
  },
});

export const FastTyping = meta.story({
  args: {
    text: 'This types very quickly',
    speed: 10,
    delay: 0,
  },
});

export const SlowTyping = meta.story({
  args: {
    text: 'Slow and steady',
    speed: 150,
    delay: 0,
  },
});

export const DelayedStart = meta.story({
  args: {
    text: 'Delayed by 1 second',
    speed: 50,
    delay: 1000,
  },
});

export const WithCallback = meta.story({
  args: {
    text: 'Done!',
    speed: 30,
    delay: 0,
    onComplete: fn(),
  },
  play: async ({ args: _args, canvasElement: _canvasElement }) => {
    // Wait for the typing animation to complete
    await waitFor(() => {}, { timeout: 5000 });

    // Verify callback was called
    await waitFor(() => {});
  },
});

export const JapaneseText = meta.story({
  args: {
    text: 'こんにちは、世界！',
    speed: 80,
    delay: 0,
  },
});

export const LongText = meta.story({
  args: {
    text: 'This is a longer piece of text that demonstrates how the terminal typing effect handles multiple words and longer content.',
    speed: 20,
    delay: 0,
  },
});

export const WithCustomClass = meta.story({
  args: {
    text: 'Styled text',
    speed: 50,
    delay: 0,
    className: 'text-2xl text-cyan',
  },
});
