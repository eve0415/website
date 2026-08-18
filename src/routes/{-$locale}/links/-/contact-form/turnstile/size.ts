/**
 * Where Turnstile's `flexible` size stops fitting.
 *
 * The slot is the viewport less 98px — 24px of page padding either side, 24px of
 * card padding either side, and the card's hairline — so it crosses `flexible`'s
 * own 300px floor at a 398px viewport. Rounded up to 420 for margin: a scrollbar
 * gutter is not always counted the same way by layout and by a media query, and
 * `compact` in the twenty pixels either side of the crossing costs nothing.
 */
const NARROW_SLOT = '(max-width: 420px)';

/**
 * Deliberately subscribes to nothing. The size is settled once, when the
 * prerendered markup hydrates and before the challenge has been started, and it
 * stays settled: re-deciding it on a resize would rebuild a widget that may
 * already be holding this visitor's token, which costs them a submission to fix
 * a layout nobody is looking at mid-send.
 */
export const sizeDecidedOnce = () => () => {
  // Nothing was subscribed to, so there is nothing to unsubscribe from.
};

export const isNarrowSlot = () => globalThis.matchMedia(NARROW_SLOT).matches;

/** Prerendering has no viewport to measure, so the HTML commits to the wide one. */
export const notNarrowWhenPrerendered = () => false;
