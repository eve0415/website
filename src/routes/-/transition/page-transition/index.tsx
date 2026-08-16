import type { Run } from './run';
import type { FC } from 'react';

import { useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import './page-transition.css';
import { CometWipe } from './comet-wipe';
import { advance, hueFor, prefersReducedMotion, projectSlug } from './run';
import { SlatCurtain } from './slat-curtain';

/**
 * The comp's page transition: a diagonal comet wipe between top-level pages,
 * and a five-slat curtain in the destination project's hue whenever a project
 * detail page is on either end.
 *
 * It reads the router rather than intercepting clicks, so every way of
 * navigating — a `Link`, the back button, `router.navigate` — plays it, and a
 * full load or a reload plays nothing, because no navigation event fires.
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

  useEffect(() => {
    // The `types` callback the router hands to `startViewTransition` carries no
    // history action, and neither does a navigation event, so forward and back
    // are told apart by where the entry sits in the history stack.
    let previousIndex = router.history.location.state.__TSR_index;
    let id = 0;

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

      const from = projectSlug(event.fromLocation?.pathname);
      const to = projectSlug(event.toLocation.pathname);

      id += 1;
      setRun({
        id,
        slats: from !== null || to !== null,
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
  };

  return run.slats ? <SlatCurtain key={run.id} run={run} onSettled={onSettled} /> : <CometWipe key={run.id} run={run} onSettled={onSettled} />;
};
