import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { PAGES } from '../dist/client-output';

/** What `analyze()` hands back, reached through the builder rather than imported: `axe-core` is a transitive dependency and pnpm does not hoist it. */
type Violations = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'];

/**
 * The Japanese half of the prerendered pages, one per route.
 *
 * Not all twenty, and **not twenty times two themes** — both halves of that
 * were measured rather than assumed.
 *
 * The locales are the same components with different copy: no route renders a
 * different tree for `/en`, and axe scores structure and computed colour,
 * neither of which the copy moves.
 *
 * The light/dark axis does not exist here at all. `prefers-color-scheme`,
 * `light-dark()` and Tailwind's `dark:` appear nowhere in `src/` and nowhere in
 * `dist/client/` — the one `color-scheme` in the built output is tailwind-merge's
 * own class-group table in `cn-*.js`, inert data naming classes nobody writes —
 * and running each of these pages under `emulateMedia({ colorScheme })` both
 * ways returned a byte-identical result: every violation, every pass and every
 * incomplete, ratios included.
 *
 * The axis that *does* move every colour on the page is the clock. Measured at
 * its two extremes and again at the hardest band the design names for itself —
 * 17時半, where `--sky-glass-bg` flips from `rgba(255,255,255,0.32)` to
 * `rgba(5,2,28,0.32)`, `--sky-accent` from navy to neon and the title ink
 * inverts — axe's full result is still identical on all ten pages. It has to
 * be; see `PINNED_CLOCK`.
 *
 * If a locale grows a component of its own, add the English paths here.
 */
const JA_PATHS = PAGES.filter(page => page.alternates.some(([tag, url]) => tag === 'x-default' && url === page.url)).map(page => new URL(page.url).pathname);

/**
 * One clock, pinned — and pinned for the marker below, not for contrast.
 *
 * `SkyClock` returns before painting when the reading already equals the
 * prerendered 深夜 0時, so between 00:00:00 and 00:00:59 local nothing writes
 * `--sky-*` and the wait below would time out on every page, for one minute a
 * day. The hydration spec pins noon for the same reason; this agrees with it.
 *
 * A second clock would buy nothing, and that was measured three times over —
 * 13時 against 22時半, and noon against 17時半, all ten pages, identical every
 * time. axe declines to score contrast against a background it cannot resolve,
 * and on this site that is everything the clock touches: text on the sky
 * gradient (`h1`, `h2`, the whole nav) and text on the translucent glass both
 * come back *incomplete*, 13 to 27 nodes a page, which `analyze()` reports
 * separately from `violations` and which this spec therefore never sees. What
 * is left for `color-contrast` to actually score, 2 to 54 nodes a page, sits on
 * the opaque `.ev-on-panel` surfaces — which `palette.ts` holds at their night
 * colours all day on purpose. So the one rule that could tell two clocks apart
 * is blind to everything that differs between them. Add the second clock the
 * day axe can resolve a gradient, or the day sky-tinted text lands on an opaque
 * surface.
 */
const PINNED_CLOCK = new Date('2026-01-01T12:00:00Z');

/**
 * `SkyClock`'s write onto `<html>`, which says the page hydrated and the
 * palette on screen is the pinned one.
 *
 * It is also the stale-server detector. `reuseExistingServer` is on locally, and
 * `vite preview`'s asset manifest is fixed at startup — so a server left running
 * across a rebuild serves fresh HTML pointing at bundle names it will not hand
 * out, the page never hydrates, and every test here times out on this wait. A red
 * `PAINTED` means rebuild and restart the server before looking at axe at all.
 */
const PAINTED = /--sky-root/;

/**
 * Long enough for `OpeningCurtain` to retire.
 *
 * Under the reduced-motion emulation below the curtain does not play, but it
 * ships in the prerendered HTML and leaves through a `setTimeout(…, 0)` and a
 * React commit — both of which land after the effect that writes the palette.
 * Scanned before that, every page still carries an opaque full-viewport
 * overlay for axe to compute its backgrounds against. This is the margin over
 * one task and one commit, not a guess at how long anything animates.
 */
const SETTLE_MS = 500;

/**
 * Every failing node as one readable line: rule id, selector, and what the
 * check measured — which for `color-contrast` is the ratio and both colours.
 * `expect(violations).toEqual([])` prints the whole nested result object per
 * node instead, which is unreadable at ten pages.
 */
const lines = (violations: Violations): string[] =>
  violations.flatMap(violation =>
    violation.nodes.map(node => {
      const why = [...node.any, ...node.all, ...node.none].map(check => check.message).join('; ');
      return `${violation.id} @ ${node.target.join(' ')} — ${why}`;
    }),
  );

test.describe('every prerendered page passes axe', () => {
  for (const path of JA_PATHS) {
    test(path, async ({ page }) => {
      // Three things at once, all of them about scanning a settled page.
      // `OpeningCurtain` does not play, so it neither covers the viewport for
      // three seconds nor marks the rest of the body `inert`. `SkyClock` snaps
      // to the clock in one paint instead of crossfading over 1.1s of
      // requestAnimationFrame, so the palette axe measures is the pinned one
      // rather than whichever frame `PAINTED` happened to land on. And the
      // `view()`-driven entrances stop. That last one is not cosmetic: a
      // `view()` timeline advances on scroll, not on time, so left alone
      // `.ev-hl` and `.ev-reveal` sit at opacity 0 for as long as nobody
      // scrolls and axe skips them outright — measured on `/`, reduced motion
      // puts 22 more elements above half opacity and gives axe 173 nodes to
      // score rather than 164.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.clock.setFixedTime(PINNED_CLOCK);

      const response = await page.goto(path);
      expect(response?.status()).toBe(200);

      await expect(page.locator('html')).toHaveAttribute('style', PAINTED);
      await page.waitForTimeout(SETTLE_MS);

      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(lines(violations)).toEqual([]);
    });
  }
});
