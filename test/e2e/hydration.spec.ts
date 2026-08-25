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
 * The marker that says hydration happened at all.
 *
 * `SkyClock` (`src/routes/{-$locale}/-/sky/sky-clock.tsx`) writes the whole
 * `--sky-*` palette onto `document.documentElement` from an effect, so an
 * inline `style` on `<html>` exists only after React has mounted. It is not
 * what catches a mismatch — React reports one within about twenty milliseconds
 * of this write and in either order, measured — but it is what fails a page
 * whose bundle never ran, which would otherwise report an empty error list and
 * pass.
 */
const HYDRATED = /--sky-root/;

/**
 * The clock every page is loaded under.
 *
 * Not decoration. `SkyClock` skips its first paint when the reading already
 * equals the prerendered 0, so between 00:00:00 and 00:00:59 local it writes
 * no `--sky-*` at all and the marker above never appears — measured: at
 * `00:00:30Z` and `00:00:59Z` the inline style stays at `--header-h` alone,
 * and every page would fail for one minute a day. Pinning noon also makes the
 * browser's clock reliably disagree with the prerendered midnight, so a coarse
 * clock read during render — `getHours()`, not just a timestamp — is a
 * mismatch on every run rather than on 23 hours out of 24.
 */
const NOON = new Date('2026-01-01T12:00:00Z');

/**
 * How long to keep listening after hydration.
 *
 * React does not report a recoverable error at a moment any DOM state marks:
 * against a deliberately mismatched build the gap from the effect above to the
 * `error` event measured between 0.1ms and 20.6ms over five runs, with the
 * error first in one of them. Asserting straight after the marker passed all
 * twenty pages on a build that was genuinely broken. This is the margin over
 * that, not a guess at how long hydration takes.
 */
const SETTLE_MS = 500;

test.describe('every prerendered page hydrates without a page error', () => {
  for (const path of PATHS) {
    test(path, async ({ page }) => {
      // React 19 does not log a hydration mismatch to the console: it goes
      // through onRecoverableError to reportError, which surfaces as a window
      // `error` event, and Playwright reports that as `pageerror`.
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));

      await page.clock.setFixedTime(NOON);
      const response = await page.goto(path);
      // Asserted so a page missing from `dist/` fails loudly instead of passing
      // with an empty error list.
      expect(response?.status()).toBe(200);

      await expect(page.locator('html')).toHaveAttribute('style', HYDRATED);
      await page.waitForTimeout(SETTLE_MS);

      expect(errors).toEqual([]);
    });
  }
});
