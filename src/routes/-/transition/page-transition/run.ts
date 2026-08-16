export const prefersReducedMotion = () => globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

export const projectSlug = (pathname: string | undefined): string | null => (pathname === undefined ? null : (PROJECT_PATH.exec(pathname)?.[1] ?? null));

export const hueFor = (slug: string | null): SlatHue => (slug === null ? CYAN : (PROJECT_HUES.get(slug) ?? CYAN));

type Phase = 'in' | 'out';

export interface Run {
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
export const advance = (run: Run): Run => (run.phase === 'in' && run.covered && run.committed ? { ...run, phase: 'out', covered: false } : run);

export const OVERLAY = 'pointer-events-none fixed inset-0 z-40 overflow-hidden';

export interface RunProps {
  run: Run;
  /** Called when the last-finishing element of the current phase settles. */
  onSettled: () => void;
}
