import { skyPalette } from '../ui/ambient/sky-background';

/** Both pages render the canonical sky, so every value here is a constant. */
const P = skyPalette(0);

type Channels = readonly [number, number, number];

const rgba = (c: Channels, alpha: number) => `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;

const mix = (a: Channels, b: Channels, t: number): Channels => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

/**
 * The three cloud tones. Each layer is the same puff shape lit differently:
 * the further back it sits, the more shade and depth colour bleeds into it.
 */
export const CLOUD_BACK = `radial-gradient(circle at 38% 26%, ${rgba(mix(P.cl, P.cs, 0.55), 0.85)}, ${rgba(P.cs, 0.88)} 56%, ${rgba(P.cd, 0.92)} 95%)`;
export const CLOUD_MID = `radial-gradient(circle at 36% 24%, ${rgba(P.cl, 0.92)}, ${rgba(mix(P.cl, P.cs, 0.45), 0.88)} 52%, ${rgba(P.cs, 0.84)} 92%)`;
export const CLOUD_FRONT = `radial-gradient(circle at 35% 23%, ${rgba(P.cl, 0.96)}, ${rgba(mix(P.cl, P.cs, 0.3), 0.92)} 52%, ${rgba(mix(P.cs, P.cd, 0.3), 0.82)} 92%)`;

/** The glow behind the cat, sitting on top of the cloud sea. */
export const CAT_GLOW = `radial-gradient(closest-side, ${rgba(P.cl, 0.42)}, ${rgba(P.cs, 0.16)} 58%, transparent 76%)`;

/** Lights inside the cloud sea: nebula, cloud shade, and a white core. */
export const GLOW_A = rgba(P.na, 0.5);
export const GLOW_B = rgba(P.cs, 0.5);
export const GLOW_W = rgba(P.cl, 0.28);

/** The dimmer set that bridges the hero into the page below it. */
export const GLOW_MID_A = rgba(P.cs, 0.28);
export const GLOW_MID_B = rgba(P.na, 0.2);
export const GLOW_MID_C = rgba(P.nb, 0.5);

/** Closest-side radial, the shape every glow above is painted with. */
export const glow = (color: string, fade: number) => `radial-gradient(closest-side, ${color}, transparent ${fade}%)`;
