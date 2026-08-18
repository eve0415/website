import type { LabKey } from '#i18n/copy';

interface LabProbe {
  key: LabKey;
  name: string;
  /**
   * Runs in the browser only. `CSS` and the DOM globals do not exist during the
   * prerender, and there is no honest answer to guess there.
   */
  probe: () => boolean;
}

/**
 * Single-argument `CSS.supports` is specified to return false — not throw — for
 * a condition it cannot parse, which is exactly what an engine lacking the
 * feature does. So no guard is needed here, only the guarantee that this never
 * runs on the server, where `CSS` is undefined.
 */
const css = (condition: string): boolean => CSS.supports(condition);

/**
 * `CSS.supports` cannot answer this one: an unknown `env()` still parses, so it
 * reports true everywhere. Measuring is the only honest probe — a browser that
 * knows `preferred-text-scale` resolves the width, one that does not leaves the
 * declaration invalid and the element at zero.
 */
const preferredTextScale = (): boolean => {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;visibility:hidden;width:calc(10px * env(preferred-text-scale))';
  document.body.insertAdjacentElement('beforeend', probe);
  const { width } = probe.getBoundingClientRect();
  probe.remove();
  return width > 0;
};

/** Declaration order is render order. */
export const LAB_PROBES: readonly LabProbe[] = [
  { key: 'navigationApi', name: 'Navigation API', probe: () => 'navigation' in globalThis },
  { key: 'viewTransitions', name: 'View Transitions (element)', probe: () => 'startViewTransition' in Element.prototype },
  { key: 'scrollState', name: 'scroll-state()', probe: () => css('container-type: scroll-state') },
  { key: 'scrollDriven', name: 'Scroll-driven animations', probe: () => css('animation-timeline: view()') },
  { key: 'siblingIndex', name: 'sibling-index()', probe: () => css('animation-delay: calc(sibling-index() * 1s)') },
  { key: 'squircleCorners', name: 'corner-shape', probe: () => css('corner-shape: squircle') },
  { key: 'textBoxTrim', name: 'text-box-trim', probe: () => css('text-box: trim-both cap alphabetic') },
  { key: 'textScale', name: 'text-scale (meta)', probe: preferredTextScale },
  { key: 'fieldSizing', name: 'field-sizing', probe: () => css('field-sizing: content') },
  { key: 'cssFunction', name: 'CSS @function', probe: () => css('at-rule(@function)') },
  { key: 'gapDecorations', name: 'Gap decorations', probe: () => css('row-rule: 1px solid red') },
  { key: 'urlPattern', name: 'URLPattern', probe: () => 'URLPattern' in globalThis },
  { key: 'anchorPositioning', name: 'Anchor positioning', probe: () => css('anchor-name: --a') },
  { key: 'detailsContent', name: '::details-content / :open', probe: () => css('selector(::details-content)') && css('selector(:open)') },
  { key: 'scrollend', name: 'scrollend', probe: () => 'onscrollend' in globalThis },
  { key: 'durationFormat', name: 'Intl.DurationFormat', probe: () => 'DurationFormat' in Intl },
  { key: 'promiseTry', name: 'Promise.try()', probe: () => 'try' in Promise },
];

/**
 * The keys this browser supports. A set rather than a per-key record so
 * "not probed yet" stays representable as the absence of the whole set, and
 * never has to be spelled as a third value on every row.
 */
let answered: ReadonlySet<LabKey> | undefined;

/**
 * `useSyncExternalStore`'s two snapshots are exactly the shape of this problem:
 * the server has no answer and says so, the browser probes once and says what
 * it found, and React re-renders the difference after hydration instead of
 * warning about it. The result is memoised because the snapshot has to be
 * reference-stable — a fresh Set every call would loop forever — and because
 * support does not change within a page's life.
 */
export const subscribeToSupport = (): (() => void) => () => {
  // Browser support is fixed for the life of the document; nothing to unsubscribe from.
};

export const readSupport = (): ReadonlySet<LabKey> => {
  answered ??= new Set(LAB_PROBES.filter(entry => entry.probe()).map(entry => entry.key));
  return answered;
};

/** No probing happened during the prerender, and pretending otherwise is what causes mismatches. */
export const readSupportOnServer = (): undefined => undefined;
