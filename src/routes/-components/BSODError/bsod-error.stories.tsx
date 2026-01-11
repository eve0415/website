import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { expect, fn, waitFor, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { SudoRmRfError } from '#routes/sys/-components/Terminal/commands';

import BSODError from './bsod-error';

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
  decorators: [
    Story => {
      const rootRoute = createRootRoute({
        component: Story,
      });
      const router = createRouter({
        routeTree: rootRoute,
        history: createMemoryHistory({ initialEntries: ['/error'] }),
      });
      return <RouterProvider router={router} />;
    },
  ],
});

/**
 * Default BSOD for SudoRmRfError (Easter Egg)
 * Shows Windows 11-style blue screen with progress animation and Revert button
 *
 * Note: With reduced motion enabled (as in visual regression tests),
 * progress starts at 100% and buttons are immediately visible.
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

    // Should show progress (100% with reduced motion, any value otherwise)
    await expect(canvas.getByTestId('bsod-progress')).toBeInTheDocument();

    // Should show QR code
    await expect(canvas.getByTestId('bsod-qrcode')).toBeInTheDocument();

    // Should show stop code
    await expect(canvas.getByTestId('bsod-stopcode')).toHaveTextContent('SYSTEM_DIAGNOSTIC_FAILURE');
  },
});

/**
 * Generic error - Now shows BSOD layout (unified experience)
 * All errors show the playful BSOD, no more simple error view
 */
export const GenericError = meta.story({
  args: {
    error: new Error('An unexpected error occurred in the application'),
    reset: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should show BSOD layout (not simple error)
    await expect(canvas.getByText(':(')).toBeInTheDocument();

    // Should show progress
    await expect(canvas.getByTestId('bsod-progress')).toBeInTheDocument();

    // Should show stop code with the error message
    await expect(canvas.getByTestId('bsod-stopcode')).toHaveTextContent('An unexpected error occurred in the application');
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
 * Progress complete - Shows all buttons after 100%
 * For easter egg: Restart, Home, and Revert buttons appear
 */
export const ProgressComplete = meta.story({
  args: {
    error: new SudoRmRfError(),
    reset: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for progress to complete
    await waitFor(() => expect(canvas.getByTestId('bsod-progress')).toHaveTextContent('100% complete'), { timeout: 5000 });

    // All buttons should appear for easter egg
    await expect(canvas.getByTestId('bsod-reset')).toBeInTheDocument();
    await expect(canvas.getByTestId('bsod-reset')).toHaveTextContent('Restart');
    await expect(canvas.getByTestId('bsod-home')).toBeInTheDocument();
    await expect(canvas.getByTestId('bsod-home')).toHaveTextContent('Home');
    await expect(canvas.getByTestId('bsod-revert')).toBeInTheDocument();
    await expect(canvas.getByTestId('bsod-revert')).toHaveTextContent('Revert');
  },
});

/**
 * Progress complete for regular error
 * Only Restart and Home buttons appear (no Revert)
 */
export const ProgressCompleteRegularError = meta.story({
  args: {
    error: new Error('Regular error'),
    reset: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for progress to complete
    await waitFor(() => expect(canvas.getByTestId('bsod-progress')).toHaveTextContent('100% complete'), { timeout: 5000 });

    // Restart and Home should appear
    await expect(canvas.getByTestId('bsod-reset')).toBeInTheDocument();
    await expect(canvas.getByTestId('bsod-home')).toBeInTheDocument();

    // Revert should NOT appear for regular errors
    await expect(canvas.queryByTestId('bsod-revert')).not.toBeInTheDocument();
  },
});

/**
 * QR Code variants
 *
 * The QR code links to one of four random destinations:
 * - YouTube (Rickroll)
 * - GitHub (eve0415)
 * - eve0415.net
 * - GitHub repo
 *
 * The "visit" link always points to the GitHub repo.
 */
export const QRCodeDisplay = meta.story({
  args: {
    error: new SudoRmRfError(),
    reset: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the QR code section. The QR destination is randomly selected. The "visit" link always points to github.com/eve0415/website.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // QR code should be visible
    await expect(canvas.getByTestId('bsod-qrcode')).toBeInTheDocument();

    // Should have repo link (always the same)
    const repoLink = canvas.getByText('github.com/eve0415/website');
    await expect(repoLink).toBeInTheDocument();
    await expect(repoLink).toHaveAttribute('href', 'https://github.com/eve0415/website');
    await expect(repoLink).toHaveAttribute('target', '_blank');
    await expect(repoLink).toHaveAttribute('rel', expect.stringContaining('noopener'));
  },
});

/**
 * Long error message - Tests multi-line stop code display
 */
export const LongErrorMessage = meta.story({
  args: {
    error: new Error(
      'This is a very long error message that should wrap to multiple lines in the stop code area. It tests how the component handles long error messages gracefully without breaking the layout.',
    ),
    reset: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should show the long error in stop code
    await expect(canvas.getByTestId('bsod-stopcode')).toHaveTextContent(/very long error message/);
  },
});

/**
 * Empty error message - Falls back to UNKNOWN_ERROR
 */
export const EmptyErrorMessage = meta.story({
  args: {
    error: new Error(''),
    reset: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should show BSOD layout
    await expect(canvas.getByText(':(')).toBeInTheDocument();

    // Should show fallback in stop code
    await expect(canvas.getByTestId('bsod-stopcode')).toHaveTextContent('UNKNOWN_ERROR');
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
 * Messages display
 * Shows that random messages from the pool are displayed
 */
export const MessagesDisplay = meta.story({
  args: {
    error: new SudoRmRfError(),
    reset: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should have some message text (content varies due to randomization)
    // Check for the help text which is always the same
    await expect(canvas.getByText(/For more information about this issue/i)).toBeInTheDocument();
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

/**
 * Mobile viewport
 * Tests the responsive layout on smaller screens
 */
export const MobileViewport = meta.story({
  args: {
    error: new SudoRmRfError(),
    reset: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Core elements should still be visible
    await expect(canvas.getByText(':(')).toBeInTheDocument();
    await expect(canvas.getByTestId('bsod-progress')).toBeInTheDocument();
    await expect(canvas.getByTestId('bsod-qrcode')).toBeInTheDocument();
  },
});
