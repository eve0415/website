import { flushSync } from 'react-dom';

/**
 * `Element.startViewTransition` is newer than the DOM lib, so it is described
 * here and reached only through the guard below — the guard proves the method
 * is there before anything calls it, which is what an assertion would have
 * skipped.
 */
interface ScopedViewTransitionHost {
  startViewTransition: (update: () => void) => void;
}

const hasScopedViewTransition = (node: Element): node is Element & ScopedViewTransitionHost =>
  'startViewTransition' in node && typeof node.startViewTransition === 'function';

/**
 * Applies `update` as a view transition scoped to `node`, and plainly where the
 * browser has no scoped transitions.
 *
 * Scoped rather than `document.startViewTransition`: a document-level capture
 * paints a still image of the whole page for the length of the animation, which
 * stops the sky and the clouds behind the form. Only the box being swapped
 * should hold still.
 *
 * The synchronous commit is what makes the callback's DOM change land inside
 * the transition — React would otherwise commit it after the snapshot was
 * taken, and the animation would have nothing to cross-fade between.
 */
export const swapInPlace = (node: Element | null, update: () => void): void => {
  if (node !== null && hasScopedViewTransition(node)) {
    node.startViewTransition(() => {
      flushSync(update);
    });
    return;
  }

  update();
};
