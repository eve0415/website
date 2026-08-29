import { expect, test } from '@playwright/test';

/**
 * The curtain must stop holding the page `inert` when it stops covering it.
 *
 * `inert` takes every sibling of the curtain out of the tab order and out of the
 * accessibility tree (WCAG 2.2 SC 2.4.11), so any gap between "the halves have
 * gone" and "the attribute is lifted" is a visible page nobody can click or
 * read. Retirement is driven by a `requestAnimationFrame` loop measuring whether
 * the half still covers the viewport, so the two land within a frame of each
 * other plus the design's own margin.
 *
 * No artificial delay on the bundles. An earlier version of this file delayed
 * them by a second to prove that retirement had stopped following hydration's
 * clock; it aborted its own `evaluate` against a cold server, and it stopped
 * meaning anything once retirement was tied to layout rather than to hydration.
 * The mutation that matters is still caught: take the covering check out of the
 * loop and the reduced-motion test below goes red on every run, because the
 * halves that were gone on the first frame then wait out the whole backstop.
 * This one stays green through that mutation and always has — retirement still
 * lands inside the bound, just late.
 *
 * The anchor is coverage ending, not `Animation.finished`. `curtainUp` travels
 * 101%, so the half is off the viewport at about 88% of its 800ms — measured at
 * 2943ms against an animation that ended at 3042ms — and retirement is counted
 * from there, which puts the unmount roughly 18ms past the animation's end.
 * Awaiting the animation measured from a moment the visitor never sees and lost
 * that race whenever a frame slipped: unmounting the curtain cancels its
 * animation, and a cancelled `Animation.finished` rejects with an `AbortError`
 * rather than resolving.
 */

/** The 100ms margin plus room for a loaded runner to get round to the timer. */
const MAX_GAP_MS = 500;

test('the page stops being inert when the curtain stops covering it', async ({ page }) => {
  await page.goto('/');

  const gap = await page.evaluate(async () => {
    const half = document.querySelector('#curtain > div');
    if (half === null) throw new Error('the curtain is not in the document; this test can no longer see what it exists for');
    if (half.getAnimations().length === 0) throw new Error('the curtain half is not animating; this test can no longer see what it exists for');

    // The same question the curtain asks itself, once a frame. A half that has
    // already left the document reports an empty rect, which reads as covering
    // nothing — the answer this wants in that case anyway.
    await new Promise<void>(resolve => {
      const check = () => {
        if (half.getBoundingClientRect().bottom <= 0) {
          resolve();
          return;
        }

        requestAnimationFrame(check);
      };

      requestAnimationFrame(check);
    });

    const clearedAt = performance.now();

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

    return performance.now() - clearedAt;
  });

  expect(gap).toBeLessThan(MAX_GAP_MS);
});

test('retires at once for a reader who asked for less motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await expect(page.locator('#curtain')).toHaveCount(0, { timeout: 1500 });
  expect(await page.evaluate(() => document.body.querySelector(':scope > [inert]') !== null)).toBe(false);
});
