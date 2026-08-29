import { expect, test } from '@playwright/test';

/**
 * The colour iOS Safari paints outside the layout viewport.
 *
 * Safari 26 fills the status-bar inset above the header and the floating tab
 * bar's inset below the footer by blending `html` and `body`'s background
 * *colours*; `LocalFrameView::documentBackgroundColor` has excluded background
 * images since 2011, and `theme-color` no longer overrides it. The sky is a
 * gradient, so for as long as `background: var(--sky-root)` was the only
 * declaration on the page there was nothing for that blend to read and both
 * bands came out `systemBackgroundColor` — white on a phone in light
 * appearance, white on one in dark appearance too, since WebKit only consults
 * the page's `color-scheme` when the document element sets it explicitly.
 *
 * Chromium rather than WebKit on purpose: what is asserted here is a CSS fact —
 * that the document element resolves to an opaque colour of its own — and no
 * engine disagrees about it. The WebKit-specific half is what that colour is
 * then *used* for, which no headless browser paints and only a device can show.
 */
const OPAQUE = /^rgb\(\d+, \d+, \d+\)$/;

const documentBackground = 'getComputedStyle(document.documentElement).backgroundColor';

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
    await page.clock.setFixedTime(new Date('2026-01-01T12:00:00Z'));
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('style', /--sky-root-solid/);

    const colour = await page.evaluate(documentBackground);

    expect(colour).toMatch(OPAQUE);
    expect(colour).not.toBe('rgb(255, 255, 255)');
  });
});
