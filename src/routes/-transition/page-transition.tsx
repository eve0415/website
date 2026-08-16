import type { FC } from 'react';

import { useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import './page-transition.css';

const prefersReducedMotion = () => globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The tint a project's slat curtain carries, from the comp's `HUES` map. */
interface SlatHue {
  /** The lit leading edge of every slat. */
  edge: string;
  /** `_mix(hue, [8,4,40], .58)` in the comp — the slat gradient's first stop. */
  top: string;
  /** `0 0 22px 6px rgba(hue, .55)` in the comp. */
  shadow: string;
}

const CYAN: SlatHue = { edge: '#04feff', top: 'rgb(6,109,130)', shadow: '0 0 22px 6px rgba(4,254,255,0.55)' };

/**
 * Keyed by the project's URL slug. These are the comp's own hues rather than
 * the `--hue-*` tokens: the tokens are the tag and card colours, and only three
 * of the five agree with the curtain's.
 */
const PROJECT_HUES = new Map<string, SlatHue>([
  ['ifpatcher', CYAN],
  ['cella', { edge: '#00dda8', top: 'rgb(5,95,94)', shadow: '0 0 22px 6px rgba(0,221,168,0.55)' }],
  ['oasts', { edge: '#22c4ff', top: 'rgb(19,85,130)', shadow: '0 0 22px 6px rgba(34,196,255,0.55)' }],
  ['dotclaude', { edge: '#c449d0', top: 'rgb(87,33,111)', shadow: '0 0 22px 6px rgba(196,73,208,0.55)' }],
  ['website', { edge: '#f76997', top: 'rgb(108,46,87)', shadow: '0 0 22px 6px rgba(247,105,151,0.55)' }],
]);

/** `/projects/cella` and `/en/projects/cella`; anything else is a top-level page. */
const PROJECT_PATH = /^(?:\/en)?\/projects\/([^/]+)\/?$/;

const projectSlug = (pathname: string | undefined): string | null => (pathname === undefined ? null : (PROJECT_PATH.exec(pathname)?.[1] ?? null));

const hueFor = (slug: string | null): SlatHue => (slug === null ? CYAN : (PROJECT_HUES.get(slug) ?? CYAN));

type Phase = 'in' | 'out';

interface Run {
  /** Bumped per navigation, so a run that starts during one restarts the animations. */
  id: number;
  /** A project detail page is on one end of the navigation, so slats rather than the comet. */
  slats: boolean;
  phase: Phase;
  /** Going back: the comet mirrors, and the slats reverse. */
  back: boolean;
  /** Slats rise rather than fall. */
  up: boolean;
  hue: SlatHue;
  /** The cover animation has finished. */
  covered: boolean;
  /** The router has committed the new page. */
  committed: boolean;
}

/**
 * The uncover only starts once the screen is covered *and* the new page is
 * there. The comp could hard-code 430ms because the comp is its own router;
 * here the load is what it is, and whichever of the two lands last wins.
 */
const advance = (run: Run): Run => (run.phase === 'in' && run.covered && run.committed ? { ...run, phase: 'out', covered: false } : run);

const WIPE_ANIMATION = {
  in: 'wipeIn .43s cubic-bezier(.7,.05,.3,1) both',
  out: 'wipeOut .47s cubic-bezier(.6,0,.3,1) both',
};

const SLAT_KEYFRAMES = {
  up: { in: 'slatUpIn', out: 'slatUpOut' },
  down: { in: 'slatDownIn', out: 'slatDownOut' },
};

const SLAT_ORDER = [0, 1, 2, 3, 4];
const LAST_SLAT = SLAT_ORDER.length - 1;

const OVERLAY = 'pointer-events-none fixed inset-0 z-40 overflow-hidden';

interface RunProps {
  run: Run;
  /** Called when the last-finishing element of the current phase settles. */
  onSettled: () => void;
}

const CometWipe: FC<RunProps> = ({ run, onSettled }) => (
  <div aria-hidden='true' className={OVERLAY}>
    <div className='absolute inset-[-60%]' style={{ transform: run.back ? 'rotate(12deg) scaleX(-1)' : 'rotate(-12deg)' }}>
      <div className='absolute inset-0' style={{ animation: WIPE_ANIMATION[run.phase] }} onAnimationEnd={onSettled}>
        <div className='absolute inset-0 bg-[linear-gradient(90deg,#05021c_0%,#0a0530_60%,#0d0836_100%)]' />
        <span className='absolute top-[32%] left-[22%] size-[3px] animate-[twinkle_1.4s_ease-in-out_infinite] rounded-full bg-(--star-white)' />
        <span className='absolute top-[55%] left-[48%] size-[2px] animate-[twinkle_1.1s_ease-in-out_.3s_infinite] rounded-full bg-(--star-ice)' />
        <span className='absolute top-[44%] left-[72%] size-[2px] animate-[twinkle_1.6s_ease-in-out_.6s_infinite] rounded-full bg-(--star-lilac)' />
        <div className='absolute inset-y-0 left-0 w-[48px] bg-[linear-gradient(90deg,rgba(4,254,255,.28),rgba(4,254,255,0))]' />
        <div className='absolute inset-y-0 left-[-2px] w-[3px] bg-[linear-gradient(180deg,rgba(4,254,255,0)_8%,#04feff_34%,#00dda8_66%,rgba(0,221,168,0)_92%)] shadow-[0_0_26px_7px_rgba(4,254,255,.45)]' />
        <span className='absolute top-[41%] left-[-7px] size-[13px] rounded-full bg-(--star-white) shadow-[0_0_22px_8px_rgba(4,254,255,.8)]' />
      </div>
    </div>
  </div>
);

const SlatCurtain: FC<RunProps> = ({ run, onSettled }) => {
  const keyframes = SLAT_KEYFRAMES[run.up ? 'up' : 'down'][run.phase];
  const edge = { background: run.hue.edge, boxShadow: run.hue.shadow };

  return (
    <div aria-hidden='true' className={`${OVERLAY} flex`}>
      {SLAT_ORDER.map(index => {
        // Left to right as they rise, right to left as they fall — the stagger
        // always runs away from the page you came from.
        const order = run.up ? index : LAST_SLAT - index;

        return (
          <div
            key={index}
            className='relative -mx-px flex-1'
            style={{
              background: `linear-gradient(${run.up ? '180deg' : '0deg'}, ${run.hue.top} 0%, #0a0530 36%, #05021c 100%)`,
              animation: `${keyframes} .4s var(--ease-comet) ${(order * 0.05).toFixed(2)}s both`,
            }}
            onAnimationEnd={order === LAST_SLAT ? onSettled : undefined}
          >
            <span className='absolute inset-x-0 h-[3px]' style={run.up ? { top: 0, ...edge } : { bottom: 0, ...edge }} />
          </div>
        );
      })}
    </div>
  );
};

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
 * length of the animation, which is the same thing `-links/scoped-view-
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
