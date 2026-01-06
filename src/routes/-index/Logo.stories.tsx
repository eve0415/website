import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';

import Logo from './Logo';

const meta = preview.meta({
  component: Logo,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    animate: { control: 'boolean' },
    className: { control: 'text' },
  },
});

export const Default = meta.story({
  args: {
    animate: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const svg = canvas.getByRole('img', { name: 'eve0415 ロゴ' });
    await expect(svg).toBeInTheDocument();
  },
});

export const Static = meta.story({
  args: {
    animate: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const svg = canvas.getByRole('img', { name: 'eve0415 ロゴ' });
    await expect(svg).toBeInTheDocument();
  },
});

export const WithCustomClass = meta.story({
  args: {
    animate: false,
    className: 'w-48 h-48 text-cyan',
  },
});

export const LargeSize = meta.story({
  args: {
    animate: true,
    className: 'w-64 h-64',
  },
});
