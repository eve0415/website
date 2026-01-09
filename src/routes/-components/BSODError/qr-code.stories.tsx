import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import QRCode from './qr-code';

const meta = preview.meta({
  component: QRCode,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    url: { control: 'text' },
    size: { control: 'number' },
  },
  decorators: [
    Story => (
      <div className='rounded bg-white p-4'>
        <Story />
      </div>
    ),
  ],
});

/**
 * Default QR code with GitHub repo URL
 */
export const Default = meta.story({
  args: {
    url: 'https://github.com/eve0415/website',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const svg = canvas.getByTitle('QR code');
    await expect(svg).toBeInTheDocument();
  },
});

/**
 * Static version for visual regression testing
 */
export const Static = meta.story({
  args: {
    url: 'https://github.com/eve0415/website',
  },
  play: async context => {
    await testAllViewports(context);

    const canvas = within(context.canvasElement);
    await expect(canvas.getByTitle('QR code')).toBeInTheDocument();
  },
});

/**
 * Small QR code (40px)
 */
export const SmallSize = meta.story({
  args: {
    url: 'https://eve0415.net',
    size: 40,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByTitle('QR code');
    await expect(title).toBeInTheDocument();
    const svg = title.closest('svg');
    await expect(svg).toHaveAttribute('width', '40');
    await expect(svg).toHaveAttribute('height', '40');
  },
});

/**
 * Large QR code (120px)
 */
export const LargeSize = meta.story({
  args: {
    url: 'https://eve0415.net',
    size: 120,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByTitle('QR code');
    await expect(title).toBeInTheDocument();
    const svg = title.closest('svg');
    await expect(svg).toHaveAttribute('width', '120');
    await expect(svg).toHaveAttribute('height', '120');
  },
});

/**
 * QR code with a long URL (YouTube Rickroll)
 */
export const LongUrl = meta.story({
  args: {
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    size: 100,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTitle('QR code')).toBeInTheDocument();
  },
});

/**
 * All sizes comparison
 */
export const SizeComparison = meta.story({
  render: () => (
    <div className='flex items-end gap-4'>
      <div className='text-center'>
        <QRCode url='https://eve0415.net' size={40} />
        <p className='mt-2 text-black text-xs'>40px</p>
      </div>
      <div className='text-center'>
        <QRCode url='https://eve0415.net' size={80} />
        <p className='mt-2 text-black text-xs'>80px (default)</p>
      </div>
      <div className='text-center'>
        <QRCode url='https://eve0415.net' size={120} />
        <p className='mt-2 text-black text-xs'>120px</p>
      </div>
    </div>
  ),
});
