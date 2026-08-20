import type { FC } from 'react';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import './page-transition/page-transition.css';
import { tw } from '#lib/tw';

/** Delay 2.15s + 0.8s of travel, then the small margin the comp leaves. */
const CURTAIN_MS = 3050;

/**
 * Whether there is an intro to sit through: never during the prerender, and not
 * in a browser that asked for less motion, where the reduced-motion rules have
 * already collapsed the whole thing to nothing.
 */
const subscribeToHydration = () => () => {
  // Hydration happens once and never comes undone; nothing to unsubscribe from.
};
const playsOnClient = () => !globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
const playsOnServer = () => false;

/**
 * `pointer-events` sits on the halves rather than on the wrapper, so what blocks
 * the page is exactly what covers it: while a half is over the viewport it eats
 * clicks, and once it has slid out hit testing no longer finds it. That is the
 * whole retirement mechanism for a reader with scripts off, and it needs no
 * animation — `visibility` cannot do the job, because Chrome holds a discrete
 * `to { visibility: hidden }` at `visible` even with the fill applied.
 */
const HALF = tw('pointer-events-auto absolute inset-x-0 overflow-hidden bg-[#00000a]');
const STAR = tw('absolute rounded-full');

/**
 * The comp's opening curtain: two halves parting from the centre while a comet
 * crosses and a seam line grows and fades.
 *
 * It is in the prerendered HTML on purpose. Mounting it after hydration would
 * show the page first and then cover it, which is the one thing an opening
 * curtain must not do — so it ships closed, and everything it needs to get out
 * of the way again is CSS. The unmount below only keeps the DOM tidy when
 * scripts do run.
 *
 * Nothing gates this on a session: the comp plays it on every document load,
 * and so does this. Under `prefers-reduced-motion` the blanket rule in
 * `__root.css` collapses every duration and delay, so the halves are already
 * gone on the first frame — which is exactly why `plays` also has to withhold
 * the skip button and cut the wait to nothing. Left alone, a reader who asked
 * for less motion would get a skip control hanging over a finished page.
 *
 * `pointer-events` is only half of what an opaque overlay owes. For the three
 * seconds it is up, everything underneath stays in the tab order unless it is
 * made `inert`, so a keyboard visitor tabs through a header, a page and a
 * footer none of which they can see (WCAG 2.2 SC 2.4.11). The skip control is
 * also the first thing in here and takes focus on mount — as the last element
 * in the body it was reachable only by tabbing past everything it exists to
 * skip, which took longer than simply waiting.
 */
export const OpeningCurtain: FC<{ skipLabel: string }> = ({ skipLabel }) => {
  const [open, setOpen] = useState(true);
  // Also gates the skip control out of the prerendered HTML, where it would be
  // a dead button for anyone with scripts off.
  const plays = useSyncExternalStore(subscribeToHydration, playsOnClient, playsOnServer);
  const rootRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const id = setTimeout(
      () => {
        setOpen(false);
      },
      plays ? CURTAIN_MS : 0,
    );

    return () => {
      clearTimeout(id);
    };
  }, [plays]);

  /**
   * Everything the curtain covers is taken out of the tab order and out of the
   * accessibility tree for as long as it is up. The curtain is a direct child
   * of `<body>`, so its siblings are exactly the page — marking them rather
   * than wrapping them keeps the flex chain in `{-$locale}/route.tsx` intact.
   *
   * `open` is in the dependency list and not only `plays`: retiring the curtain
   * returns null but does not unmount this component, so without it the cleanup
   * never runs and the whole page stays inert for the rest of the session.
   */
  useEffect(() => {
    const curtain = rootRef.current;
    if (!plays || !open || curtain === null) return;

    const covered = [...document.body.children].filter(element => element !== curtain);
    for (const element of covered) element.setAttribute('inert', '');

    return () => {
      for (const element of covered) element.removeAttribute('inert');
    };
  }, [plays, open]);

  /** Escape is the shortcut for the button, for anyone who does not tab to it. */
  useEffect(() => {
    if (!plays || !open) return;

    skipRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [plays, open]);

  if (!open) return null;

  return (
    <div ref={rootRef} className='pointer-events-none fixed inset-0 z-50 overflow-hidden'>
      {plays ? (
        <button
          ref={skipRef}
          type='button'
          onClick={() => {
            setOpen(false);
          }}
          className='pointer-events-auto absolute right-6 bottom-6 min-h-(--hit-target) animate-[fadeIn_.4s_ease_.8s_both] rounded-[999px] border border-(--line-white) bg-[rgba(0,0,10,.4)] px-5.5 py-2.5 font-sans text-(length:--text-small) text-(--ink-title)'
        >
          {skipLabel}
        </button>
      ) : null}

      <div className={`${HALF} top-0 bottom-1/2 animate-[curtainUp_.8s_var(--ease-curtain)_2.15s_forwards]`}>
        <span aria-hidden='true' className={`${STAR} top-[30%] left-[15%] size-[3px] animate-[twinkle_1.8s_ease-in-out_infinite] bg-(--star-white)`} />
        <span aria-hidden='true' className={`${STAR} top-[55%] left-[70%] size-0.5 animate-[twinkle_2.2s_ease-in-out_.5s_infinite] bg-(--star-white)`} />
        <span aria-hidden='true' className={`${STAR} top-[20%] left-[85%] size-0.5 animate-[twinkle_1.6s_ease-in-out_.9s_infinite] bg-(--star-ice)`} />
        <span aria-hidden='true' className={`${STAR} top-[70%] left-[40%] size-0.5 animate-[twinkle_2s_ease-in-out_.3s_infinite] bg-(--star-white)`} />
      </div>

      <div className={`${HALF} top-1/2 bottom-0 animate-[curtainDown_.8s_var(--ease-curtain)_2.15s_forwards]`}>
        <span aria-hidden='true' className={`${STAR} top-[40%] left-[25%] size-0.5 animate-[twinkle_2.1s_ease-in-out_.7s_infinite] bg-(--star-white)`} />
        <span aria-hidden='true' className={`${STAR} top-[65%] left-[80%] size-[3px] animate-[twinkle_1.7s_ease-in-out_.2s_infinite] bg-(--star-ice)`} />
      </div>

      <div aria-hidden='true' className='absolute top-0 left-0 animate-[cometFly_1.1s_cubic-bezier(.3,.1,.35,1)_.35s_both]'>
        <div className='flex rotate-[-11deg] items-center'>
          <span className='h-[3px] w-45 rounded-xs bg-[linear-gradient(90deg,transparent,rgba(0,221,168,.7),#04feff)]' />
          <span className='ml-[-4px] size-2.5 rounded-full bg-(--star-white) shadow-[0_0_14px_4px_rgba(4,254,255,.8)]' />
        </div>
      </div>

      <div aria-hidden='true' className='pointer-events-none absolute inset-0 flex items-center justify-center'>
        <span className='block h-0.5 animate-[lineGrow_.5s_ease-out_1.5s_both,lineFade_.3s_ease_2.1s_forwards] rounded-[1px] bg-[linear-gradient(90deg,transparent,#04feff_25%,#00dda8_75%,transparent)] shadow-[0_0_18px_rgba(4,254,255,.7)]' />
      </div>
    </div>
  );
};
