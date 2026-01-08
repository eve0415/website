import { expect, fn, waitFor, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { SudoRmRfError } from '#routes/sys/-components/Terminal/commands';

import BSODError from './BSODError';

const meta = preview.meta({
  component: BSODError,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    error: { control: false },
    reset: { action: 'reset' },
    info: { control: false },
  },
});

/**
 * Default BSOD for SudoRmRfError
 * Shows Windows 11-style blue screen with progress animation
 */
export const Default = meta.story({
  args: {
    error: new SudoRmRfError(),
    reset: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should show sad face
    await expect(canvas.getByText(':(')).toBeInTheDocument();

    // Should show progress
    await expect(canvas.getByTestId('bsod-progress')).toHaveTextContent('0% complete');

    // Should show QR code
    await expect(canvas.getByTestId('bsod-qrcode')).toBeInTheDocument();

    // Should show stop code
    await expect(canvas.getByTestId('bsod-stopcode')).toHaveTextContent('SYSTEM_DIAGNOSTIC_FAILURE');
  },
});

/**
 * Generic error - Simple error display for non-intentional crashes
 */
export const GenericError = meta.story({
  args: {
    error: new Error('An unexpected error occurred in the application'),
    reset: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should show simple error layout
    await expect(canvas.getByRole('heading', { name: 'Error' })).toBeInTheDocument();

    // Should show error message
    await expect(canvas.getByText('An unexpected error occurred in the application')).toBeInTheDocument();

    // Should show Try Again button
    await expect(canvas.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
  },
});

/**
 * Progress animation in action
 * Shows the progress increasing over time
 */
export const ProgressAnimation = meta.story({
  args: {
    error: new SudoRmRfError(),
    reset: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for progress to increase from 0
    await waitFor(
      () => {
        const progressText = canvas.getByTestId('bsod-progress').textContent ?? '';
        const percentage = Number.parseInt(progressText.replace('% complete', ''), 10);
        void expect(percentage).toBeGreaterThan(0);
      },
      { timeout: 2000 },
    );
  },
});

/**
 * Progress complete - Shows reset button after 100%
 */
export const ProgressComplete = meta.story({
  args: {
    error: new SudoRmRfError(),
    reset: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should show 100%
    await waitFor(() => expect(canvas.getByTestId('bsod-progress')).toHaveTextContent('100% complete'), { timeout: 5000 });

    // Reset button should appear
    await expect(canvas.getByTestId('bsod-reset')).toBeInTheDocument();
    await expect(canvas.getByTestId('bsod-reset')).toHaveTextContent('Press any key to restart');
  },
});

/**
 * QR Code variants
 *
 * The BSOD displays one of three random destinations:
 * - YouTube (Rickroll)
 * - GitHub (eve0415)
 * - eve0415.net
 *
 * This story shows the QR code area - actual destination is randomly selected on mount.
 */
export const QRCodeDisplay = meta.story({
  args: {
    error: new SudoRmRfError(),
    reset: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows the QR code section. The destination link is randomly selected from: YouTube (Rickroll), GitHub (eve0415), or eve0415.net. Refresh to see different destinations.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // QR code should be visible
    await expect(canvas.getByTestId('bsod-qrcode')).toBeInTheDocument();

    // Should have a link
    const link = canvas.getByRole('link');
    await expect(link).toBeInTheDocument();

    // Link should have safe attributes
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  },
});

/**
 * Empty error message - Falls back to default message
 */
export const EmptyErrorMessage = meta.story({
  args: {
    error: new Error(''),
    reset: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should show fallback message
    await expect(canvas.getByText('An unexpected error occurred')).toBeInTheDocument();
  },
});

/**
 * Reset button interaction
 */
export const ResetInteraction = meta.story({
  args: {
    error: new SudoRmRfError(),
    reset: fn(),
  },
  play: async ({ canvasElement, args }: { canvasElement: HTMLElement; args: { reset: () => void } }) => {
    const canvas = within(canvasElement);

    // Wait for progress to complete and reset button to appear
    await waitFor(() => expect(canvas.getByTestId('bsod-reset')).toBeInTheDocument(), { timeout: 5000 });

    // Click reset button
    const resetButton = canvas.getByTestId('bsod-reset');
    resetButton.click();

    // Verify reset was called
    await expect(args.reset).toHaveBeenCalledTimes(1);
  },
});

/**
 * Generic error reset interaction
 */
export const GenericErrorReset = meta.story({
  args: {
    error: new Error('Test error'),
    reset: fn(),
  },
  play: async ({ canvasElement, args }: { canvasElement: HTMLElement; args: { reset: () => void } }) => {
    const canvas = within(canvasElement);

    // Click Try Again button
    const tryAgainButton = canvas.getByRole('button', { name: 'Try Again' });
    tryAgainButton.click();

    // Verify reset was called
    await expect(args.reset).toHaveBeenCalledTimes(1);
  },
});

/**
 * Main message display
 */
export const MainMessage = meta.story({
  args: {
    error: new SudoRmRfError(),
    reset: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should show main message
    await expect(canvas.getByText('Your PC ran into a problem and needs to restart.')).toBeInTheDocument();

    // Should show secondary message
    await expect(canvas.getByText(/collecting some error info/i)).toBeInTheDocument();
  },
});

/**
 * Visual elements test - Verifies all BSOD visual elements are present
 */
export const VisualElements = meta.story({
  args: {
    error: new SudoRmRfError(),
    reset: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Sad face
    await expect(canvas.getByText(':(')).toBeInTheDocument();

    // Main message
    await expect(canvas.getByText(/ran into a problem/i)).toBeInTheDocument();

    // Progress
    await expect(canvas.getByTestId('bsod-progress')).toBeInTheDocument();

    // QR code
    await expect(canvas.getByTestId('bsod-qrcode')).toBeInTheDocument();

    // QR info text
    await expect(canvas.getByText(/For more information about this issue/i)).toBeInTheDocument();

    // Stop code
    await expect(canvas.getByTestId('bsod-stopcode')).toBeInTheDocument();
  },
});
