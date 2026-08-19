import { useEffect } from 'react';

import { MIDNIGHT, skyCss, skyIsDay, skyVars } from './palette';

/** How often the clock is re-read once the page is running. */
const RESYNC_MS = 30_000;

/** The crossfade from one clock reading to the next. */
const TWEEN_MS = 1100;

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
    let dayOn = false;
    let frame = 0;

    const sync = () => {
      const target = localClock();
      if (target === clock) return;

      dayOn = skyIsDay(target, dayOn);
      const dayTo = dayOn ? 1 : 0;
      const from = clock;
      const dayFrom = day;
      const distance = shortestWay(from, target);
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
