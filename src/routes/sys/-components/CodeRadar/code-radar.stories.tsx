import { expect, fn, waitFor, within } from 'storybook/test';

import preview from '#.storybook/preview';

import CodeRadar from './code-radar';
import { emptyContributions, highActivityContributions, sampleContributions, sparseContributions } from './code-radar.fixtures';

const meta = preview.meta({
  component: CodeRadar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    Story => (
      <div className='bg-bg-primary p-8'>
        <Story />
      </div>
    ),
  ],
});

export const Default = meta.story({
  args: {
    contributionCalendar: sampleContributions,
  },
});

export const Static = meta.story({
  args: {
    contributionCalendar: sampleContributions,
  },
  play: async context => {
    const canvas = within(context.canvasElement);
    // Wait for radar to render with reduced motion (instant render)
    await waitFor(() => expect(canvas.getByRole('img', { name: /contribution radar/i })).toBeInTheDocument());
    // Canvas-based components have rendering variations across viewports due to ResizeObserver timing
    // Use single viewport screenshot instead of testAllViewports
  },
});

export const EmptyCalendar = meta.story({
  args: {
    contributionCalendar: emptyContributions,
  },
});

export const SparseActivity = meta.story({
  args: {
    contributionCalendar: sparseContributions,
  },
});

export const HighActivity = meta.story({
  args: {
    contributionCalendar: highActivityContributions,
  },
});

export const WithCallback = meta.story({
  args: {
    contributionCalendar: sampleContributions,
    onBootComplete: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for the boot animation to complete
    await waitFor(
      () => {
        // The SCANNING text should disappear after boot
        const scanningText = canvas.queryByText('SCANNING...');
        void expect(scanningText).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    // Verify callback was called
    await waitFor(() => {
      void expect(args.onBootComplete).toHaveBeenCalled();
    });
  },
});
