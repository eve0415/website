import { useEffect } from 'react';

import { prefersReducedMotion } from '#lib/prefers-reduced-motion';

import { MIDNIGHT, skyCss, skyIsDay, skyVars } from './palette';

/** How often the clock is re-read once the page is running. */
const RESYNC_MS = 30_000;

/** The crossfade from one clock reading to the next. */
const TWEEN_MS = 1100;

/**
 * Below this much of a jump, the sky is repainted in one step instead of
 * crossfaded. The crossfade is there for the arrival — the page prerenders
 * midnight and can land up to twelve hours away — and for waking from sleep.
 * A resync only ever moves the clock by a minute, which is invisible either
 * way and not worth a second of rebuilding every gradient on the page.
 */
const SNAP_HOURS = 0.25;

const easeInOutQuad = (k: number) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);

const localClock = () => {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
};

/**
 * The shortest way round a 24-hour dial. Going from 23時 to 1時 is two hours
 * forward, not twenty-two hours back, and the sky has to cross midnight rather
 * than run the whole day in reverse.
 */
const shortestWay = (from: number, to: number) => ((((to - from) % 24) + 36) % 24) - 12;

const paint = (clock: number, day: number) => {
  for (const [name, value] of Object.entries(skyVars(skyCss(clock, day)))) {
    document.documentElement.style.setProperty(name, value);
  }
};

/**
 * Advances the sky to the visitor's own local time.
 *
 * Every page prerenders 深夜 0時 — the design's canonical state, and the only
 * value that can be baked in, since reading a clock during render would differ
 * between the prerender and the browser and break hydration. So this runs after
 * mount instead, and writes the whole palette onto the document element, where
 * `__root.css` picks it up through the `--sky-*` custom properties.
 *
 * It renders nothing.
 */
export const SkyClock = () => {
  useEffect(() => {
    let clock = 0;
    let day = 0;
    /* Left undefined so the first reading picks day or night on its own
       brightness rather than through the hysteresis' night branch — a page
       opened inside the switching band would otherwise start on the wrong one
       and hold it. */
    let dayOn: boolean | undefined;
    let frame = 0;

    const sync = () => {
      const target = localClock();
      if (target === clock) return;

      dayOn = skyIsDay(target, dayOn);
      const dayTo = dayOn ? 1 : 0;

      const from = clock;
      const dayFrom = day;
      const distance = shortestWay(from, target);

      /**
       * Matches the blanket rule in `__root.css`, which flattens every CSS
       * transition on the page. The crossfade is a JS loop, so that rule cannot
       * reach it and it has to ask for itself.
       */
      if (prefersReducedMotion() || (Math.abs(distance) < SNAP_HOURS && dayTo === dayFrom)) {
        cancelAnimationFrame(frame);
        clock = target;
        day = dayTo;
        paint(clock, day);
        return;
      }

      const start = performance.now();

      const step = (now: number) => {
        const k = Math.min(1, (now - start) / TWEEN_MS);
        const e = easeInOutQuad(k);
        clock = (((from + distance * e) % 24) + 24) % 24;
        day = dayFrom + (dayTo - dayFrom) * e;
        paint(clock, day);
        if (k < 1) frame = requestAnimationFrame(step);
        else clock = target;
      };

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(step);
    };

    sync();
    const timer = setInterval(sync, RESYNC_MS);

    return () => {
      cancelAnimationFrame(frame);
      clearInterval(timer);
      for (const name of Object.keys(skyVars(MIDNIGHT))) {
        document.documentElement.style.removeProperty(name);
      }
    };
  }, []);

  return null;
};
