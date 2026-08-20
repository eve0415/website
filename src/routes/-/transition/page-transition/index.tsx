import type { Run } from './run';
import type { FC } from 'react';

import { useBlocker, useRouter } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import './page-transition.css';
import { prefersReducedMotion } from '#lib/prefers-reduced-motion';

import { CometWipe } from './comet-wipe';
import { DoorWipe } from './door-wipe';
import { advance, hueFor, isLocaleSwap, projectSlug } from './run';
import { SlatCurtain } from './slat-curtain';

/**
 * The comp's page transition: a diagonal comet wipe between top-level pages, a
 * five-slat curtain in the destination project's hue whenever a project detail
 * page is on either end, and two doors closing over the page for the one
 * navigation that changes nothing but the language.
 *
 * It reads the router rather than intercepting clicks, so every way of
 * navigating — a `Link`, the back button, `router.navigate` — plays it, and a
 * full load or a reload plays nothing, because no navigation event fires.
 *
 * A transition covers the page *before* the page changes. The router commits
 * the moment it is asked, so left alone it hands over the new page and then
 * plays an animation over the top of it — the reader watches the swap and is
 * then covered up for it. `useBlocker` is what buys the missing beat: every
 * navigation is held until the cover animation has finished, and released from
 * `onSettled`. It is only ever really blocked when a second one arrives while
 * the first is still closing — see `settle`.
 *
 * Deliberately not `viewTransition` on the navigation: the view-transition
 * pseudo tree paints in the top layer and takes no child content, so neither
 * the wipe's star field and comet head nor five separately tinted slats can be
 * expressed in it — and a document-level capture would freeze the sky for the
 * length of the animation, which is the same thing `links/-/scoped-view-
 * transition.ts` avoids for the contact form.
 */
export const PageTransition: FC = () => {
  const router = useRouter();
  const [run, setRun] = useState<Run | null>(null);
  const nextId = useRef(0);
  // Answers the blocker holding a navigation: `true` drops it, `false` lets it
  // through. Set while the cover is playing, and called once.
  const release = useRef<((dropped: boolean) => void) | null>(null);

  /**
   * Only the cover finishing releases a held navigation. Anything else that
   * takes the overlay off screen drops it instead — releasing it there would
   * put its destination on top of wherever the reader has since gone, because
   * a held navigation is a task waiting to run, not one already half done.
   */
  const settle = (dropped: boolean) => {
    const held = release.current;
    release.current = null;
    held?.(dropped);
  };

  useBlocker({
    enableBeforeUnload: false,
    shouldBlockFn: async ({ current, next, action }) => {
      // A hash or search change is not a page change, and a reader who asked
      // for less motion gets the navigation with nothing over it.
      if (current.pathname === next.pathname || prefersReducedMotion()) return false;

      // The comp refuses a second move while one is wiping, and so does this:
      // the screen would snap back open to close a second time over a page
      // that is already on its way.
      if (release.current !== null) return true;

      // `action` is what the history stack was asked to do, which is the one
      // thing a location pair cannot tell you.
      const back = action === 'BACK';
      const from = projectSlug(current.pathname);
      const to = projectSlug(next.pathname);

      return await new Promise<boolean>(resolve => {
        release.current = resolve;
        nextId.current += 1;
        setRun({
          id: nextId.current,
          // Asked before the project slugs, whose pattern spans both locales:
          // a language swap on a project page is not a project navigation.
          kind: isLocaleSwap(current.pathname, next.pathname) ? 'doors' : from !== null || to !== null ? 'slats' : 'comet',
          phase: 'in',
          back,
          up: back ? to === null : to !== null,
          hue: hueFor(to ?? from),
          covered: false,
          committed: false,
        });
      });
    },
  });

  useEffect(
    () =>
      router.subscribe('onResolved', () => {
        setRun(current => (current === null ? null : advance({ ...current, committed: true })));
      }),
    [router],
  );

  if (run === null) return null;

  const onSettled = () => {
    setRun(current => (current === null || current.phase === 'out' ? null : advance({ ...current, covered: true })));
    // Covered is the one moment the page underneath is free to change.
    if (run.phase === 'in') settle(false);
  };

  if (run.kind === 'doors') return <DoorWipe key={run.id} run={run} onSettled={onSettled} />;

  return run.kind === 'slats' ? <SlatCurtain key={run.id} run={run} onSettled={onSettled} /> : <CometWipe key={run.id} run={run} onSettled={onSettled} />;
};
