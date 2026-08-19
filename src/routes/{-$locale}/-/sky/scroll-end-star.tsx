import type { FC } from 'react';

import { useEffect, useState } from 'react';

import { ShootingStar } from './shooting-star';

/** Below this the page has barely moved, and a reward for it would be noise. */
const MIN_SCROLL = 240;
/** So it stays a thing that happens to you rather than a thing you can farm. */
const COOLDOWN_MS = 9000;
const TOP_MIN = 8;
const TOP_RANGE = 26;
/** The arc is 3s; the extra 300ms keeps the unmount clear of its last frame. */
const VISIBLE_MS = 3300;

interface Fall {
  /** Bumped per star, so the next one restarts the animation from the top. */
  id: number;
  /** Percent down the viewport. */
  top: number;
}

/**
 * The comp's reward for reading: when your scrolling settles, a single star
 * sometimes falls across the top of the viewport.
 *
 * `scrollend` is the whole point — it fires once the scroll has actually come
 * to rest, which no amount of debouncing a `scroll` handler reproduces
 * honestly, and a browser without it simply never triggers this. That is why
 * the LAB card lists it: this is the feature, not a description of one.
 *
 * Fixed rather than parented to the sky, because it belongs to the viewport you
 * stopped at, not to the page you stopped in.
 */
export const ScrollEndStar: FC = () => {
  const [fall, setFall] = useState<Fall | null>(null);

  useEffect(() => {
    let previous = 0;
    let id = 0;
    let clear: ReturnType<typeof setTimeout> | undefined;

    const onScrollEnd = () => {
      // A reader who asked for less motion gets the scroll and nothing else.
      if (globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const now = Date.now();
      if (globalThis.scrollY < MIN_SCROLL || now - previous < COOLDOWN_MS) return;

      previous = now;
      id += 1;
      setFall({ id, top: TOP_MIN + Math.random() * TOP_RANGE });

      clearTimeout(clear);
      clear = setTimeout(() => {
        setFall(null);
      }, VISIBLE_MS);
    };

    globalThis.addEventListener('scrollend', onScrollEnd);

    return () => {
      globalThis.removeEventListener('scrollend', onScrollEnd);
      clearTimeout(clear);
    };
  }, []);

  if (fall === null) return null;

  return (
    <ShootingStar key={fall.id} arc='steep' tail={130} duration={3} delay={0} play='once' className='fixed right-[5%] z-5' style={{ top: `${fall.top}%` }} />
  );
};
