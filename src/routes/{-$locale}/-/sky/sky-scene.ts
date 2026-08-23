/**
 * The scene, as the custom properties the root element carries.
 *
 * These used to be strings computed once at module load from the midnight
 * palette. They are indirections now because the sky follows the visitor's
 * clock: `SkyClock` rewrites the properties as the hours pass, and a value
 * baked in at import time would stay stuck at midnight.
 */

/** The three cloud tones — the same puff shape lit further back each time. */
export const CLOUD_BACK = 'var(--sky-cloud-back)';
export const CLOUD_MID = 'var(--sky-cloud-mid)';
export const CLOUD_FRONT = 'var(--sky-cloud-front)';

/** The glow behind the cat, sitting on top of the cloud sea. */
export const CAT_GLOW = 'var(--sky-cat-glow)';

/** Lights inside the cloud sea: nebula, cloud shade, and a white core. */
export const GLOW_A = 'var(--sky-glow-a)';
export const GLOW_B = 'var(--sky-glow-b)';
export const GLOW_W = 'var(--sky-glow-w)';

/** The dimmer set that bridges the hero into the page below it. */
export const GLOW_MID_A = 'var(--sky-glow-mid-a)';
export const GLOW_MID_B = 'var(--sky-glow-mid-b)';
export const GLOW_MID_C = 'var(--sky-glow-mid-c)';

/** Closest-side radial, the shape every glow above is painted with. */
export const glow = (color: string, fade: number) => `radial-gradient(closest-side, ${color}, transparent ${fade}%)`;
