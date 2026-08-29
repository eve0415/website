import { expect, test } from '@playwright/test';

/**
 * The curtain's two clocks, and the gap that used to open between them.
 *
 * The halves are animated by CSS out of the prerendered HTML, so they start
 * moving at the document's first paint. The effect that retires the curtain —
 * and with it the `inert` attribute the curtain puts on every sibling, which
 * takes the whole page out of the tab order and out of the accessibility tree —
 * runs at hydration, which is later by however long the bundle takes. Retiring
 * on a duration counted from hydration therefore left a visible page that could
 * not be clicked or read for exactly that difference.
 *
 * Delaying only the JavaScript is what makes the two clocks separable: the
 * stylesheets still resolve at their usual time so first paint does not move,
 * while hydration is pushed a second out. Against the old timer the gap
 * measured here was the delay itself; against the animation it is the design's
 * own 100ms margin.
 */
const JS_DELAY_MS = 1000;

/** The 100ms margin plus room for a loaded runner to get round to the timer. */
const MAX_GAP_MS = 500;

test('the page stops being inert when the curtain stops covering it', async ({ page }) => {
  await page.route(/\/assets\/.*\.js$/u, async route => {
    await new Promise(resolve => {
      setTimeout(resolve, JS_DELAY_MS);
    });
    await route.continue();
  });

  await page.goto('/');

  const gap = await page.evaluate(async () => {
    const half = document.querySelector('#curtain > div');
    const [curtain] = half?.getAnimations() ?? [];
    if (curtain === undefined) throw new Error('the curtain half is not animating; this test can no longer see what it exists for');

    await curtain.finished;
    const finishedAt = performance.now();

    // The query is written out twice rather than named: a helper here captures
    // nothing, and this whole function is serialised into the browser, so the
    // linter's advice to hoist it would put it out of scope.
    if (document.body.querySelector(':scope > [inert]') !== null) {
      await new Promise<void>(resolve => {
        const observer = new MutationObserver(() => {
          if (document.body.querySelector(':scope > [inert]') !== null) return;
          observer.disconnect();
          resolve();
        });

        observer.observe(document.body, { attributes: true, attributeFilter: ['inert'], childList: true, subtree: true });
      });
    }

    return performance.now() - finishedAt;
  });

  expect(gap).toBeLessThan(MAX_GAP_MS);
});
