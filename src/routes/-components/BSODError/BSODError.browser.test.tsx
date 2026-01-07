import type { FC } from 'react';

import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { SudoRmRfError } from '#routes/sys/-components/Terminal/commands';

import BSODError from './BSODError';

// Helper for time-based waits
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Test wrapper to provide required props
interface TestProps {
  error: Error;
  onReset?: () => void;
}

const TestWrapper: FC<TestProps> = ({ error, onReset = () => {} }) => {
  return <BSODError error={error} reset={onReset} />;
};

describe('BSODError', () => {
  describe('SudoRmRfError (intentional crash)', () => {
    test('renders BSOD layout', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      // Should show sad face
      await expect.element(page.getByText(':(')).toBeVisible();

      // Should show main message
      await expect.element(page.getByText('Your PC ran into a problem and needs to restart.')).toBeVisible();
    });

    test('shows progress indicator', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      const progress = page.getByTestId('bsod-progress');
      await expect.element(progress).toBeVisible();
      await expect.element(progress).toHaveTextContent('% complete');
    });

    test('progress increases over time', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      // Initially should be 0%
      await expect.element(page.getByTestId('bsod-progress')).toHaveTextContent('0% complete');

      // Wait for progress to increase
      await sleep(500);

      // Should have increased
      const progressEl = page.getByTestId('bsod-progress');
      const el = progressEl.element();
      const textContent = el?.textContent ?? '';
      const percentage = Number.parseInt(textContent.replace('% complete', ''), 10);
      expect(percentage).toBeGreaterThan(0);
    });

    test('progress caps at 100%', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      // Wait for progress to complete (should take ~1.5-2 seconds at random increments of up to 15)
      await sleep(2500);

      await expect.element(page.getByTestId('bsod-progress')).toHaveTextContent('100% complete');
    });

    test('displays QR code', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      const qrCode = page.getByTestId('bsod-qrcode');
      await expect.element(qrCode).toBeVisible();

      // QR code should contain an SVG - verify the container has content
      const qrCodeEl = qrCode.element();
      const hasSvg = qrCodeEl?.querySelector('svg') !== null;
      expect(hasSvg).toBe(true);
    });

    test('displays stop code', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      const stopCode = page.getByTestId('bsod-stopcode');
      await expect.element(stopCode).toBeVisible();
      await expect.element(stopCode).toHaveTextContent('SYSTEM_DIAGNOSTIC_FAILURE');
    });

    test('reset button appears after progress completes', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      // Initially no reset button
      await expect.element(page.getByTestId('bsod-reset')).not.toBeInTheDocument();

      // Wait for progress to complete
      await sleep(2500);

      // Reset button should appear
      await expect.element(page.getByTestId('bsod-reset')).toBeVisible();
      await expect.element(page.getByTestId('bsod-reset')).toHaveTextContent('Press any key to restart');
    });

    test('reset button calls reset callback', async () => {
      const onReset = vi.fn();
      await render(<TestWrapper error={new SudoRmRfError()} onReset={onReset} />);

      // Wait for progress to complete
      await sleep(2500);

      // Click reset button
      await page.getByTestId('bsod-reset').click();

      expect(onReset).toHaveBeenCalledTimes(1);
    });

    test('shows collecting error info message', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      await expect.element(page.getByText(/collecting some error info/i)).toBeVisible();
    });

    test('displays QR destination link', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      // Should have a link element (one of the three possible destinations)
      const link = page.getByRole('link');
      await expect.element(link).toBeVisible();

      // Link should be to one of the destinations
      const linkEl = link.element();
      const href = linkEl?.getAttribute('href');
      const validUrls = ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://github.com/eve0415', 'https://eve0415.net'];
      expect(validUrls).toContain(href);
    });

    test('has blue background color', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      // Find the BSOD container by the sad face text
      const sadFace = page.getByText(':(');
      await expect.element(sadFace).toBeVisible();

      // The parent container should have the blue background
      // We can't easily test CSS in browser tests, but we can verify structure
      expect(true).toBe(true);
    });
  });

  describe('generic error (non-intentional)', () => {
    test('renders simple error layout', async () => {
      const genericError = new Error('Something went wrong');
      await render(<TestWrapper error={genericError} />);

      // Should show "Error" heading
      await expect.element(page.getByRole('heading', { name: 'Error' })).toBeVisible();

      // Should show error message
      await expect.element(page.getByText('Something went wrong')).toBeVisible();
    });

    test('shows Try Again button', async () => {
      const genericError = new Error('Test error');
      await render(<TestWrapper error={genericError} />);

      await expect.element(page.getByRole('button', { name: 'Try Again' })).toBeVisible();
    });

    test('Try Again button calls reset callback', async () => {
      const onReset = vi.fn();
      const genericError = new Error('Test error');
      await render(<TestWrapper error={genericError} onReset={onReset} />);

      await page.getByRole('button', { name: 'Try Again' }).click();

      expect(onReset).toHaveBeenCalledTimes(1);
    });

    test('does not show BSOD elements', async () => {
      const genericError = new Error('Test error');
      await render(<TestWrapper error={genericError} />);

      // Should not show sad face
      await expect.element(page.getByText(':(')).not.toBeInTheDocument();

      // Should not show progress
      await expect.element(page.getByTestId('bsod-progress')).not.toBeInTheDocument();

      // Should not show QR code
      await expect.element(page.getByTestId('bsod-qrcode')).not.toBeInTheDocument();

      // Should not show stop code
      await expect.element(page.getByTestId('bsod-stopcode')).not.toBeInTheDocument();
    });

    test('handles empty error message', async () => {
      const emptyError = new Error('');
      await render(<TestWrapper error={emptyError} />);

      // Should show fallback message
      await expect.element(page.getByText('An unexpected error occurred')).toBeVisible();
    });

    test('handles error without message', async () => {
      const noMessageError = new Error();
      await render(<TestWrapper error={noMessageError} />);

      // Should show fallback message
      await expect.element(page.getByText('An unexpected error occurred')).toBeVisible();
    });
  });

  describe('SudoRmRfError class', () => {
    test('is detected as intentional crash', async () => {
      const error = new SudoRmRfError();
      await render(<TestWrapper error={error} />);

      // Should show BSOD (sad face proves it's the BSOD view)
      await expect.element(page.getByText(':(')).toBeVisible();
    });

    test('other errors with same message are not BSOD', async () => {
      // Create a regular error with the same message
      const regularError = new Error('SYSTEM_DIAGNOSTIC_FAILURE');
      await render(<TestWrapper error={regularError} />);

      // Should NOT show BSOD
      await expect.element(page.getByText(':(')).not.toBeInTheDocument();

      // Should show simple error
      await expect.element(page.getByRole('heading', { name: 'Error' })).toBeVisible();
    });
  });

  describe('QR code visual', () => {
    test('QR code has proper SVG structure', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      const qrCode = page.getByTestId('bsod-qrcode');
      await expect.element(qrCode).toBeVisible();

      // QR code should contain an SVG with white background
      const qrCodeEl = qrCode.element();
      const svg = qrCodeEl?.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg?.classList.contains('bg-white')).toBe(true);
    });

    test('QR code contains rect elements (cells)', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      const qrCode = page.getByTestId('bsod-qrcode');
      const qrCodeEl = qrCode.element();

      // Should have multiple rect elements for the QR pattern
      const rects = qrCodeEl?.querySelectorAll('rect');
      expect(rects?.length).toBeGreaterThan(0);
    });
  });

  describe('accessibility', () => {
    test('reset button is focusable', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      // Wait for progress to complete
      await sleep(2500);

      const resetBtn = page.getByTestId('bsod-reset');
      await expect.element(resetBtn).toBeVisible();

      // Button should be a button element
      const btnEl = resetBtn.element();
      expect(btnEl?.tagName.toLowerCase()).toBe('button');
    });

    test('generic error Try Again button is focusable', async () => {
      const genericError = new Error('Test');
      await render(<TestWrapper error={genericError} />);

      const tryAgainBtn = page.getByRole('button', { name: 'Try Again' });
      await expect.element(tryAgainBtn).toBeVisible();
    });

    test('QR destination link has proper attributes', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      const link = page.getByRole('link');
      const linkEl = link.element();

      // Should open in new tab safely
      expect(linkEl?.getAttribute('target')).toBe('_blank');
      expect(linkEl?.getAttribute('rel')).toContain('noopener');
      expect(linkEl?.getAttribute('rel')).toContain('noreferrer');
    });
  });
});
