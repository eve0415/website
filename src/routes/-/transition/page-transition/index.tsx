import type { Run } from './run';
import type { FC } from 'react';

import { useBlocker, useRouter } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import './page-transition.css';
import { CometWipe } from './comet-wipe';
import { DoorWipe } from './door-wipe';
import { advance, hueFor, isLocaleSwap, prefersReducedMotion, projectSlug } from './run';
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
 * The doors are the exception, and they have to be. A wipe that travels across
 * the page reads fine over content that has already changed, but doors exist to
 * hide the swap, and the router commits the moment it is asked — so the reader
 * would watch the page turn English and *then* be covered up. `useBlocker` is
 * what buys the missing beat: the language navigation is held until the halves
 * have met, and released from `onSettled`. Nothing is ever really blocked.
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
  // Set while a language navigation is waiting on the doors, and called once.
  const release = useRef<(() => void) | null>(null);

  const proceed = () => {
    const held = release.current;
    release.current = null;
    held?.();
  };

  useBlocker({
    enableBeforeUnload: false,
    shouldBlockFn: async ({ current, next }) => {
      if (prefersReducedMotion() || !isLocaleSwap(current.pathname, next.pathname)) return false;

      // Whatever was waiting goes through now: a second swap must not strand
      // the first navigation behind a promise nothing will resolve.
      proceed();

      await new Promise<void>(resolve => {
        release.current = resolve;
        nextId.current += 1;
        // The doors read neither a direction nor a project hue.
        setRun({ id: nextId.current, kind: 'doors', phase: 'in', back: false, up: false, hue: hueFor(null), covered: false, committed: false });
      });

      return false;
    },
  });

  useEffect(() => {
    // The `types` callback the router hands to `startViewTransition` carries no
    // history action, and neither does a navigation event, so forward and back
    // are told apart by where the entry sits in the history stack.
    let previousIndex = router.history.location.state.__TSR_index;

    const stopNavigate = router.subscribe('onBeforeNavigate', event => {
      const nextIndex = event.toLocation.state.__TSR_index;
      const back = nextIndex < previousIndex;
      previousIndex = nextIndex;

      // A hash or search change is not a page change, and a reader who asked
      // for less motion gets the navigation with nothing over it.
      if (!event.pathChanged || prefersReducedMotion()) {
        setRun(null);
        return;
      }

      // A language swap arrives here with its doors already closing, put up by
      // the blocker one beat ago. Starting a second run would reopen them.
      if (isLocaleSwap(event.fromLocation?.pathname, event.toLocation.pathname)) return;

      const from = projectSlug(event.fromLocation?.pathname);
      const to = projectSlug(event.toLocation.pathname);

      nextId.current += 1;
      setRun({
        id: nextId.current,
        kind: from !== null || to !== null ? 'slats' : 'comet',
        phase: 'in',
        back,
        up: back ? to === null : to !== null,
        hue: hueFor(to ?? from),
        covered: false,
        committed: false,
      });
    });

    const stopResolve = router.subscribe('onResolved', () => {
      setRun(current => (current === null ? null : advance({ ...current, committed: true })));
    });

    return () => {
      stopNavigate();
      stopResolve();
    };
  }, [router]);

  if (run === null) return null;

  const onSettled = () => {
    setRun(current => (current === null || current.phase === 'out' ? null : advance({ ...current, covered: true })));
    // Covered is the one moment the page underneath is free to change.
    proceed();
  };

  if (run.kind === 'doors') return <DoorWipe key={run.id} run={run} onSettled={onSettled} />;

  return run.kind === 'slats' ? <SlatCurtain key={run.id} run={run} onSettled={onSettled} /> : <CometWipe key={run.id} run={run} onSettled={onSettled} />;
};
