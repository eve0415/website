import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import ErrorCascade from './error-cascade';

const meta = preview.meta({
  component: ErrorCascade,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    Story => (
      <div className='bg-background relative h-screen w-full'>
        <Story />
      </div>
    ),
  ],
});

// --- Progress Stories ---

export const Empty = meta.story({
  args: {
    progress: 0,
    enabled: true,
  },
  play: async context => {
    const canvas = within(context.canvasElement);

    // Should render nothing at progress 0
    const errors = canvas.queryByText(/ENOENT|TypeError|NullPointer/);
    await expect(errors).toBeNull();

    // Skip viewport testing - component returns null when no errors
  },
});

export const FirstErrors = meta.story({
  args: {
    progress: 0.15,
    enabled: true,
  },
  play: async context => {
    const canvas = within(context.canvasElement);

    // Should show early errors (ENOENT appears at threshold 0.05)
    await expect(canvas.getByText(/ENOENT.*no such file or directory/)).toBeInTheDocument();

    await testAllViewports(context);
  },
});

export const Escalating = meta.story({
  args: {
    progress: 0.5,
    enabled: true,
  },
  play: async context => {
    const canvas = within(context.canvasElement);

    // Should show multiple errors including stage 2
    // At progress 0.5, effectiveProgress ≈ 0.62, showing thresholds <= 0.62
    await expect(canvas.getByText(/ENOENT/)).toBeInTheDocument();
    await expect(canvas.getByText(/TypeError/)).toBeInTheDocument();

    await testAllViewports(context);
  },
});

export const Catastrophic = meta.story({
  args: {
    progress: 0.95,
    enabled: true,
  },
  play: async context => {
    const canvas = within(context.canvasElement);

    // At progress 0.95, effectiveProgress ≈ 0.965, should show most errors
    await expect(canvas.getByText(/ENOENT/)).toBeInTheDocument();
    // Use specific text to avoid matching stack trace line
    await expect(canvas.getByText(/Segmentation fault \(core dumped\)/)).toBeInTheDocument();

    await testAllViewports(context);
  },
});

export const Full = meta.story({
  args: {
    progress: 1,
    enabled: true,
  },
  play: async context => {
    const canvas = within(context.canvasElement);

    // At full progress, all errors should be visible
    await expect(canvas.getByText(/ENOENT/)).toBeInTheDocument();
    await expect(canvas.getByText(/Kernel panic/)).toBeInTheDocument();

    await testAllViewports(context);
  },
});

export const Disabled = meta.story({
  args: {
    progress: 0.5,
    enabled: false,
  },
  play: async context => {
    const canvas = within(context.canvasElement);

    // Should render nothing when disabled
    const errors = canvas.queryByText(/ENOENT|TypeError|NullPointer/);
    await expect(errors).toBeNull();

    // Skip viewport testing - component returns null when disabled
  },
});

// --- Stack Trace Visibility Stories ---

export const WithStackTraces = meta.story({
  args: {
    progress: 0.3,
    enabled: true,
  },
  play: async context => {
    const canvas = within(context.canvasElement);

    // At progress 0.3, effectiveProgress ≈ 0.42, should show first 2-3 errors with stack traces
    await expect(canvas.getByText(/ENOENT/)).toBeInTheDocument();
    // Stack trace should be visible
    await expect(canvas.getByText(/at Object\.openSync/)).toBeInTheDocument();

    await testAllViewports(context);
  },
});
