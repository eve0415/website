import { expect, test } from '@playwright/test';

/**
 * The document element resolves to an opaque colour of its own.
 *
 * Why iOS Safari needs that, and why it is on `html` rather than `body`, is in
 * the `html` rule in `src/routes/__root.css`. What is asserted here is only the
 * CSS half of it, and that half is engine-independent — which is why this runs
 * in chromium with the rest of the suite. The WebKit-specific half is what the
 * colour is then *used* for: filling the status-bar and tab-bar insets, which
 * no headless browser paints and only a device can show.
 *
 * White is `rgb(255, 255, 255)` and passes `OPAQUE`, so the second assertion in
 * each test is the one that catches the failure this file exists for.
 */
const OPAQUE = /^rgb\(\d+, \d+, \d+\)$/;

/**
 * `SkyClock`'s write onto `<html>`, narrowed to the property under test.
 *
 * `hydration.spec.ts` and `a11y.spec.ts` wait on `--sky-root` for the same
 * reason; this file wants the token beside it, since a `skyVars` that dropped
 * `--sky-root-solid` would still satisfy the broader pattern.
 */
const PAINTED = /--sky-root-solid/;

/**
 * The same pinned noon as the other two specs, and pinned for the same reason:
 * `SkyClock` returns before painting when the reading already equals the
 * prerendered 深夜 0時, so for one minute a day nothing is written and the wait
 * below would time out.
 */
const NOON = new Date('2026-01-01T12:00:00Z');

const documentBackground = () => getComputedStyle(document.documentElement).backgroundColor;

test.describe('the document element carries an opaque background colour', () => {
  /*
   * The prerendered state, which is what a phone paints first and keeps for as
   * long as the bundle takes to run. JavaScript off rather than racing
   * `SkyClock`: the effect that overwrites the palette lands within a frame, so
   * there is no reliable moment to sample this otherwise.
   */
  test.describe('before hydration', () => {
    test.use({ javaScriptEnabled: false });

    test('resolves from the prerendered 深夜 palette', async ({ page }) => {
      await page.goto('/');
      const colour = await page.evaluate(documentBackground);

      expect(colour).toMatch(OPAQUE);
      expect(colour).not.toBe('rgb(255, 255, 255)');
    });
  });

  /*
   * And after, where `SkyClock` has replaced every `--sky-*` inline on the same
   * element. The token has to survive that write: it is emitted by `skyVars`
   * alongside the gradient, so a clock that moves one moves both.
   */
  test('follows the clock once the palette is written', async ({ page }) => {
    await page.clock.setFixedTime(NOON);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('style', PAINTED);

    const colour = await page.evaluate(documentBackground);

    expect(colour).toMatch(OPAQUE);
    expect(colour).not.toBe('rgb(255, 255, 255)');
  });
});
