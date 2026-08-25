import { expect, test } from '@playwright/test';

import { PAGES } from '../dist/client-output';

/**
 * Every prerendered page, as the path a browser asks for.
 *
 * Read off the same literal table the `dist` suite asserts against rather than
 * transcribed a third time: `client-output.ts` imports nothing but `node:fs`
 * and `node:path`, so it costs no vitest machinery here, and its import-time
 * throw when `dist/client` is missing is wanted — a run that reports zero pages
 * is the one failure this file cannot see.
 */
const PATHS = PAGES.map(page => new URL(page.url).pathname);

/**
 * The marker that says hydration has happened.
 *
 * `SkyClock` (`src/routes/{-$locale}/-/sky/sky-clock.tsx`) writes the whole
 * `--sky-*` palette onto `document.documentElement` from an effect, so an
 * inline `style` on `<html>` exists only after React has mounted. It says
 * hydration ran, not that it succeeded — React falls back to a client render on
 * a mismatch and the effect still fires — which is exactly the wait a
 * mismatch-hunting assertion wants.
 */
const HYDRATED = /--sky-root/;

test.describe('every prerendered page hydrates without a page error', () => {
  for (const path of PATHS) {
    test(path, async ({ page }) => {
      // React 19 does not log a hydration mismatch to the console: it goes
      // through onRecoverableError to reportError, which surfaces as a window
      // `error` event, and Playwright reports that as `pageerror`.
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));

      const response = await page.goto(path);
      // Asserted so a page missing from `dist/` fails loudly instead of passing
      // with an empty error list.
      expect(response?.status()).toBe(200);

      await expect(page.locator('html')).toHaveAttribute('style', HYDRATED);

      expect(errors).toEqual([]);
    });
  }
});
