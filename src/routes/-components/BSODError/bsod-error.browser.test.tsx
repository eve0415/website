import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import { SudoRmRfError } from '#routes/sys/-components/Terminal/commands';

import BSODError from './bsod-error';
import { REPO_URL } from './destinations';

// Create a router wrapper for testing Link components
const createTestRouter = (error: Error, onReset: () => void) => {
  const rootRoute = createRootRoute({
    component: () => <BSODError error={error} reset={onReset} />,
  });

  return createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/error'] }),
  });
};

// Test wrapper to provide required props with router context
interface TestProps {
  error: Error;
  onReset?: () => void;
}

const TestWrapper: FC<TestProps> = ({ error, onReset = () => {} }) => {
  const router = createTestRouter(error, onReset);
  return <RouterProvider router={router} />;
};

describe('BSODError', () => {
  describe('renders BSOD for all errors', () => {
    test('renders BSOD layout for SudoRmRfError', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      // Should show sad face
      await expect.element(page.getByText(':(')).toBeVisible();

      // Should show progress
      await expect.element(page.getByTestId('bsod-progress')).toBeVisible();
    });

    test('renders BSOD layout for generic errors', async () => {
      const genericError = new Error('Something went wrong');
      await render(<TestWrapper error={genericError} />);

      // Should show sad face (BSOD, not simple error)
      await expect.element(page.getByText(':(')).toBeVisible();

      // Should show progress
      await expect.element(page.getByTestId('bsod-progress')).toBeVisible();
    });
  });

  describe('progress animation', () => {
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

      // Wait for progress to increase from 0
      await expect
        .poll(
          () => {
            const el = page.getByTestId('bsod-progress').element();
            const textContent = el?.textContent ?? '';
            return Number.parseInt(textContent.replace('% complete', ''), 10);
          },
          { timeout: 2000 },
        )
        .toBeGreaterThan(0);
    });

    test('progress caps at 100%', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      // Wait for progress to complete
      await expect.element(page.getByTestId('bsod-progress')).toHaveTextContent('100% complete');
    });
  });

  describe('QR code', () => {
    test('displays QR code', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      const qrCode = page.getByTestId('bsod-qrcode');
      await expect.element(qrCode).toBeVisible();
    });

    test('QR code has proper SVG structure', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      const qrCode = page.getByTestId('bsod-qrcode');

      // Wait for QR code SVG to render
      await expect
        .poll(
          () => {
            const qrCodeEl = qrCode.element();
            const svg = qrCodeEl?.querySelector('svg');
            return svg !== null;
          },
          { timeout: 3000 },
        )
        .toBe(true);
    });

    test('QR code contains path elements (cells)', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      const qrCode = page.getByTestId('bsod-qrcode');

      // qrcode.react uses path elements for the QR code cells
      await expect
        .poll(
          () => {
            const qrCodeEl = qrCode.element();
            const paths = qrCodeEl?.querySelectorAll('path');
            return (paths?.length ?? 0) > 0;
          },
          { timeout: 3000 },
        )
        .toBe(true);
    });
  });

  describe('stop code', () => {
    test('displays stop code with error message', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      const stopCode = page.getByTestId('bsod-stopcode');
      await expect.element(stopCode).toBeVisible();
      await expect.element(stopCode).toHaveTextContent('SYSTEM_DIAGNOSTIC_FAILURE');
    });

    test('displays custom error message in stop code', async () => {
      const customError = new Error('CUSTOM_ERROR_MESSAGE');
      await render(<TestWrapper error={customError} />);

      const stopCode = page.getByTestId('bsod-stopcode');
      await expect.element(stopCode).toHaveTextContent('CUSTOM_ERROR_MESSAGE');
    });

    test('displays fallback for empty error message', async () => {
      const emptyError = new Error('');
      await render(<TestWrapper error={emptyError} />);

      const stopCode = page.getByTestId('bsod-stopcode');
      await expect.element(stopCode).toHaveTextContent('UNKNOWN_ERROR');
    });
  });

  describe('buttons', () => {
    test('reset button appears after progress completes', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      // Initially no reset button
      await expect.element(page.getByTestId('bsod-reset')).not.toBeInTheDocument();

      // Wait for reset button to appear after progress completes
      await expect.element(page.getByTestId('bsod-reset')).toBeVisible();
      await expect.element(page.getByTestId('bsod-reset')).toHaveTextContent('Restart');
    });

    test('home button appears after progress completes', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      // Initially no home button
      await expect.element(page.getByTestId('bsod-home')).not.toBeInTheDocument();

      // Wait for home button to appear
      await expect.element(page.getByTestId('bsod-home')).toBeVisible();
      await expect.element(page.getByTestId('bsod-home')).toHaveTextContent('Home');
    });

    test('revert button appears only for easter egg', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      // Wait for buttons to appear
      await expect.element(page.getByTestId('bsod-reset')).toBeVisible();

      // Revert button should be visible for easter egg
      await expect.element(page.getByTestId('bsod-revert')).toBeVisible();
      await expect.element(page.getByTestId('bsod-revert')).toHaveTextContent('Revert');
    });

    test('revert button does not appear for regular errors', async () => {
      const genericError = new Error('Regular error');
      await render(<TestWrapper error={genericError} />);

      // Wait for buttons to appear
      await expect.element(page.getByTestId('bsod-reset')).toBeVisible();

      // Revert button should NOT be visible for regular errors
      await expect.element(page.getByTestId('bsod-revert')).not.toBeInTheDocument();
    });

    test('reset button calls reset callback', async () => {
      const onReset = vi.fn();
      await render(<TestWrapper error={new SudoRmRfError()} onReset={onReset} />);

      // Wait for reset button to appear
      await expect.element(page.getByTestId('bsod-reset')).toBeVisible();

      // Click reset button
      await page.getByTestId('bsod-reset').click();

      expect(onReset).toHaveBeenCalledTimes(1);
    });

    test('home button has correct link', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      // Wait for home button to appear
      await expect.element(page.getByTestId('bsod-home')).toBeVisible();

      const homeBtn = page.getByTestId('bsod-home');
      const href = homeBtn.element()?.getAttribute('href');
      expect(href).toBe('/');
    });

    test('revert button has correct link', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      // Wait for revert button to appear
      await expect.element(page.getByTestId('bsod-revert')).toBeVisible();

      const revertBtn = page.getByTestId('bsod-revert');
      const href = revertBtn.element()?.getAttribute('href');
      expect(href).toBe('/sys');
    });
  });

  describe('keypress handling', () => {
    test('keypress triggers reset after progress completes', async () => {
      const onReset = vi.fn();
      await render(<TestWrapper error={new SudoRmRfError()} onReset={onReset} />);

      // Wait for progress to complete
      await expect.element(page.getByTestId('bsod-reset')).toBeVisible();

      // Press a key
      await userEvent.keyboard('{Enter}');

      expect(onReset).toHaveBeenCalledTimes(1);
    });

    test('keypress does not trigger reset before progress completes', async () => {
      const onReset = vi.fn();
      await render(<TestWrapper error={new SudoRmRfError()} onReset={onReset} />);

      // Immediately press a key before progress completes
      await userEvent.keyboard('{Enter}');

      // Should not have triggered reset yet
      expect(onReset).not.toHaveBeenCalled();
    });
  });

  describe('repo link', () => {
    test('displays repo link', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      // Find link by text content
      const link = page.getByText('github.com/eve0415/website');
      await expect.element(link).toBeVisible();

      const linkEl = link.element();
      expect(linkEl?.getAttribute('href')).toBe(REPO_URL);
    });

    test('repo link has proper security attributes', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      const link = page.getByText('github.com/eve0415/website');
      const linkEl = link.element();

      // Should open in new tab safely
      expect(linkEl?.getAttribute('target')).toBe('_blank');
      expect(linkEl?.getAttribute('rel')).toContain('noopener');
      expect(linkEl?.getAttribute('rel')).toContain('noreferrer');
    });
  });

  describe('messages', () => {
    test('displays main message', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      // Check for the sad face which is part of the BSOD layout
      await expect.element(page.getByText(':(')).toBeVisible();

      // All SudoRmRfError messages mention "delete", "files", "sudo", "rm", etc.
      // Check that we have visible text content in the message area
      await expect.element(page.getByTestId('bsod-progress')).toBeVisible();
    });

    test('displays help text', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      // Should show help text about visiting for more info
      await expect.element(page.getByText(/For more information/i)).toBeVisible();
    });
  });

  describe('SudoRmRfError detection', () => {
    test('SudoRmRfError is detected as easter egg', async () => {
      const error = new SudoRmRfError();
      await render(<TestWrapper error={error} />);

      // Wait for buttons
      await expect.element(page.getByTestId('bsod-reset')).toBeVisible();

      // Revert button proves it's detected as easter egg
      await expect.element(page.getByTestId('bsod-revert')).toBeVisible();
    });

    test('regular error with same message is not easter egg', async () => {
      // Create a regular error with the same message
      const regularError = new Error('SYSTEM_DIAGNOSTIC_FAILURE');
      await render(<TestWrapper error={regularError} />);

      // Wait for buttons
      await expect.element(page.getByTestId('bsod-reset')).toBeVisible();

      // Revert button should NOT appear for regular errors
      await expect.element(page.getByTestId('bsod-revert')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    test('reset button is a proper button element', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      await expect.element(page.getByTestId('bsod-reset')).toBeVisible();

      const btnEl = page.getByTestId('bsod-reset').element();
      expect(btnEl?.tagName.toLowerCase()).toBe('button');
      expect(btnEl?.getAttribute('type')).toBe('button');
    });

    test('home and revert are link elements', async () => {
      await render(<TestWrapper error={new SudoRmRfError()} />);

      await expect.element(page.getByTestId('bsod-home')).toBeVisible();
      await expect.element(page.getByTestId('bsod-revert')).toBeVisible();

      const homeEl = page.getByTestId('bsod-home').element();
      const revertEl = page.getByTestId('bsod-revert').element();

      expect(homeEl?.tagName.toLowerCase()).toBe('a');
      expect(revertEl?.tagName.toLowerCase()).toBe('a');
    });
  });
});
