/**
 * Whether the browser has asked for less motion, at the moment it is called.
 *
 * A function rather than a constant on purpose: everything here is prerendered
 * and then hydrated, so reading `matchMedia` at module load would run during the
 * prerender, where there is no `matchMedia` at all. Call it inside an effect, an
 * event handler, or a `useSyncExternalStore` client snapshot — never in render.
 *
 * `__root.css` already collapses every duration and drops the scroll-driven
 * entrances under the same query. This is for the half CSS cannot reach: work
 * scheduled in JavaScript, which has to be skipped rather than shortened.
 */
export const prefersReducedMotion = () => globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
