import { createRouterHarness } from '@tanstack-router-testing/react-router-testing';
/* oxlint-disable vitest/no-conditional-in-test -- Vitest poll() callbacks require null-coalescing for safe DOM access */
import { createRootRoute } from '@tanstack/react-router';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import { SudoRmRfError } from '#lib/sudo-rm-rf-error';

import BSODError from './bsod-error';
import { REPO_URL } from './destinations';

const createHarness = (error: Error, onReset: () => void = () => {}) =>
  createRouterHarness({
    routeTree: createRootRoute({ component: () => <BSODError error={error} reset={onReset} /> }),
    initialEntries: ['/error'],
  });

describe('bSODError', () => {
  let harness: ReturnType<typeof createHarness>;

  describe('renders BSOD for all errors', () => {
    test('renders BSOD layout for SudoRmRfError', async () => {
      harness = createHarness(new SudoRmRfError());
      await render(<harness.TestRouterProvider />);

      await expect.element(page.getByText(':(')).toBeVisible();
      await expect.element(page.getByTestId('bsod-progress')).toBeVisible();
    });

    test('renders BSOD layout for generic errors', async () => {
      harness = createHarness(new Error('Something went wrong'));
      await render(<harness.TestRouterProvider />);

      await expect.element(page.getByText(':(')).toBeVisible();
      await expect.element(page.getByTestId('bsod-progress')).toBeVisible();
    });
  });

  describe('progress animation', () => {
    test('shows progress indicator', async () => {
      harness = createHarness(new SudoRmRfError());
      await render(<harness.TestRouterProvider />);

      const progress = page.getByTestId('bsod-progress');
      await expect.element(progress).toBeVisible();
      await expect.element(progress).toHaveTextContent('% complete');
    });

    test('progress increases over time', async () => {
      harness = createHarness(new SudoRmRfError());
      await render(<harness.TestRouterProvider />);

      await expect.element(page.getByTestId('bsod-progress')).toHaveTextContent('0% complete');

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
      harness = createHarness(new SudoRmRfError());
      await render(<harness.TestRouterProvider />);

      await expect.element(page.getByTestId('bsod-progress')).toHaveTextContent('100% complete');
    });
  });

  describe('qR code', () => {
    test('displays QR code', async () => {
      harness = createHarness(new SudoRmRfError());
      await render(<harness.TestRouterProvider />);

      const qrCode = page.getByTestId('bsod-qrcode');
      await expect.element(qrCode).toBeVisible();
    });

    test('qR code has proper SVG structure', async () => {
      harness = createHarness(new SudoRmRfError());
      await render(<harness.TestRouterProvider />);

      const qrCode = page.getByTestId('bsod-qrcode');

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

    test('qR code contains path elements (cells)', async () => {
      harness = createHarness(new SudoRmRfError());
      await render(<harness.TestRouterProvider />);

      const qrCode = page.getByTestId('bsod-qrcode');

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
      harness = createHarness(new SudoRmRfError());
      await render(<harness.TestRouterProvider />);

      const stopCode = page.getByTestId('bsod-stopcode');
      await expect.element(stopCode).toBeVisible();
      await expect.element(stopCode).toHaveTextContent('SYSTEM_DIAGNOSTIC_FAILURE');
    });

    test('displays custom error message in stop code', async () => {
      harness = createHarness(new Error('CUSTOM_ERROR_MESSAGE'));
      await render(<harness.TestRouterProvider />);

      const stopCode = page.getByTestId('bsod-stopcode');
      await expect.element(stopCode).toHaveTextContent('CUSTOM_ERROR_MESSAGE');
    });

    test('displays fallback for empty error message', async () => {
      // oxlint-disable-next-line unicorn/error-message -- Intentionally testing empty error handling
      harness = createHarness(new Error(''));
      await render(<harness.TestRouterProvider />);

      const stopCode = page.getByTestId('bsod-stopcode');
      await expect.element(stopCode).toHaveTextContent('UNKNOWN_ERROR');
    });
  });

  describe('buttons', () => {
    test('reset button appears after progress completes', async () => {
      harness = createHarness(new SudoRmRfError());
      await render(<harness.TestRouterProvider />);

      await expect.element(page.getByTestId('bsod-reset')).not.toBeInTheDocument();
      await expect.element(page.getByTestId('bsod-reset')).toBeVisible();
      await expect.element(page.getByTestId('bsod-reset')).toHaveTextContent('Restart');
    });

    test('home button appears after progress completes', async () => {
      harness = createHarness(new SudoRmRfError());
      await render(<harness.TestRouterProvider />);

      await expect.element(page.getByTestId('bsod-home')).not.toBeInTheDocument();
      await expect.element(page.getByTestId('bsod-home')).toBeVisible();
      await expect.element(page.getByTestId('bsod-home')).toHaveTextContent('Home');
    });

    test('revert button appears only for easter egg', async () => {
      harness = createHarness(new SudoRmRfError());
      await render(<harness.TestRouterProvider />);

      await expect.element(page.getByTestId('bsod-reset')).toBeVisible();
      await expect.element(page.getByTestId('bsod-revert')).toBeVisible();
      await expect.element(page.getByTestId('bsod-revert')).toHaveTextContent('Revert');
    });

    test('revert button does not appear for regular errors', async () => {
      harness = createHarness(new Error('Regular error'));
      await render(<harness.TestRouterProvider />);

      await expect.element(page.getByTestId('bsod-reset')).toBeVisible();
      await expect.element(page.getByTestId('bsod-revert')).not.toBeInTheDocument();
    });

    test('reset button calls reset callback', async () => {
      const onReset = vi.fn();
      harness = createHarness(new SudoRmRfError(), onReset);
      await render(<harness.TestRouterProvider />);

      await expect.element(page.getByTestId('bsod-reset')).toBeVisible();
      await page.getByTestId('bsod-reset').click();

      expect(onReset).toHaveBeenCalledOnce();
    });

    test('home button has correct link', async () => {
      harness = createHarness(new SudoRmRfError());
      await render(<harness.TestRouterProvider />);

      await expect.element(page.getByTestId('bsod-home')).toBeVisible();

      const homeBtn = page.getByTestId('bsod-home');
      const href = homeBtn.element()?.getAttribute('href');
      expect(href).toBe('/');
    });

    test('revert button has correct link', async () => {
      harness = createHarness(new SudoRmRfError());
      await render(<harness.TestRouterProvider />);

      await expect.element(page.getByTestId('bsod-revert')).toBeVisible();

      const revertBtn = page.getByTestId('bsod-revert');
      const href = revertBtn.element()?.getAttribute('href');
      expect(href).toBe('/sys');
    });
  });

  describe('keypress handling', () => {
    test('keypress triggers reset after progress completes', async () => {
      const onReset = vi.fn();
      harness = createHarness(new SudoRmRfError(), onReset);
      await render(<harness.TestRouterProvider />);

      await expect.element(page.getByTestId('bsod-reset')).toBeVisible();
      await userEvent.keyboard('{Enter}');

      expect(onReset).toHaveBeenCalledOnce();
    });

    test('keypress does not trigger reset before progress completes', async () => {
      const onReset = vi.fn();
      harness = createHarness(new SudoRmRfError(), onReset);
      await render(<harness.TestRouterProvider />);

      await userEvent.keyboard('{Enter}');

      expect(onReset).not.toHaveBeenCalled();
    });
  });

  describe('repo link', () => {
    test('displays repo link', async () => {
      harness = createHarness(new SudoRmRfError());
      await render(<harness.TestRouterProvider />);

      const link = page.getByText('github.com/eve0415/website');
      await expect.element(link).toBeVisible();

      const linkEl = link.element();
      expect(linkEl?.getAttribute('href')).toBe(REPO_URL);
    });

    test('repo link has proper security attributes', async () => {
      harness = createHarness(new SudoRmRfError());
      await render(<harness.TestRouterProvider />);

      const link = page.getByText('github.com/eve0415/website');
      const linkEl = link.element();

      expect(linkEl?.getAttribute('target')).toBe('_blank');
      expect(linkEl?.getAttribute('rel')).toContain('noopener');
      expect(linkEl?.getAttribute('rel')).toContain('noreferrer');
    });
  });

  describe('messages', () => {
    test('displays main message', async () => {
      harness = createHarness(new SudoRmRfError());
      await render(<harness.TestRouterProvider />);

      await expect.element(page.getByText(':(')).toBeVisible();
      await expect.element(page.getByTestId('bsod-progress')).toBeVisible();
    });

    test('displays help text', async () => {
      harness = createHarness(new SudoRmRfError());
      await render(<harness.TestRouterProvider />);

      await expect.element(page.getByText(/For more information/i)).toBeVisible();
    });
  });

  describe('sudoRmRfError detection', () => {
    test('sudoRmRfError is detected as easter egg', async () => {
      harness = createHarness(new SudoRmRfError());
      await render(<harness.TestRouterProvider />);

      await expect.element(page.getByTestId('bsod-reset')).toBeVisible();
      await expect.element(page.getByTestId('bsod-revert')).toBeVisible();
    });

    test('regular error with same message is not easter egg', async () => {
      harness = createHarness(new Error('SYSTEM_DIAGNOSTIC_FAILURE'));
      await render(<harness.TestRouterProvider />);

      await expect.element(page.getByTestId('bsod-reset')).toBeVisible();
      await expect.element(page.getByTestId('bsod-revert')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    test('reset button is a proper button element', async () => {
      harness = createHarness(new SudoRmRfError());
      await render(<harness.TestRouterProvider />);

      await expect.element(page.getByTestId('bsod-reset')).toBeVisible();

      const btnEl = page.getByTestId('bsod-reset').element();
      expect(btnEl?.tagName.toLowerCase()).toBe('button');
      expect(btnEl?.getAttribute('type')).toBe('button');
    });

    test('home and revert are link elements', async () => {
      harness = createHarness(new SudoRmRfError());
      await render(<harness.TestRouterProvider />);

      await expect.element(page.getByTestId('bsod-home')).toBeVisible();
      await expect.element(page.getByTestId('bsod-revert')).toBeVisible();

      const homeEl = page.getByTestId('bsod-home').element();
      const revertEl = page.getByTestId('bsod-revert').element();

      expect(homeEl?.tagName.toLowerCase()).toBe('a');
      expect(revertEl?.tagName.toLowerCase()).toBe('a');
    });
  });
});
