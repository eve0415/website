import { expect, fn, waitFor, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports, withDisabledAnimations } from '#.storybook/viewports';

import CodeRadar from './CodeRadar';
import { emptyContributions, highActivityContributions, sampleContributions, sparseContributions } from './CodeRadar.fixtures';

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
  decorators: [withDisabledAnimations],
  play: async context => {
    // Wait for reduced motion to take effect (instant render)
    await new Promise(resolve => setTimeout(resolve, 100));
    await testAllViewports(context);
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
