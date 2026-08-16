import type { CSSProperties, FC, ReactNode } from 'react';

import { cn } from '../../cn';

import { StarField } from './star-field';

type Rgb = readonly [number, number, number];
type HeroHex = readonly [string, string, string, string, string, string];
type RootHex = readonly [string, string, string];
type HeroRgb = readonly [Rgb, Rgb, Rgb, Rgb, Rgb, Rgb];
type RootRgb = readonly [Rgb, Rgb, Rgb];

/**
 * A single keyframe of the 24h sky, as authored.
 *
 * `hero` holds the 6 hero gradient stops, `root` the 3 page stops, `cl`/`cs`/`cd`
 * the cloud light/shade/deep tones, `na`/`nb` the nebula pair, `star` and `day`
 * are 0–1 scalars, and `inkT`/`inkK`/`inkS` are the title/kicker/sub inks.
 */
interface RawStop {
  t: number;
  hero: HeroHex;
  root: RootHex;
  cl: string;
  cs: string;
  cd: string;
  na: string;
  nb: string;
  star: number;
  day: number;
  inkT: string;
  inkK: string;
  inkS: string;
}

/** A sky keyframe with every hex resolved to an rgb triplet. */
export interface SkyPalette {
  hero: HeroRgb;
  root: RootRgb;
  cl: Rgb;
  cs: Rgb;
  cd: Rgb;
  na: Rgb;
  nb: Rgb;
  star: number;
  day: number;
  inkT: Rgb;
  inkK: Rgb;
  inkS: Rgb;
}

/** A `SkyPalette` still carrying the clock value it was authored at. */
interface PaletteStop extends SkyPalette {
  t: number;
}

/** Ready-to-use CSS strings for a clock value. */
export interface SkyCss {
  rootBg: string;
  heroBg: string;
  nebulaBg: string;
  starAlpha: number;
  inkTitle: string;
  inkKicker: string;
  inkSub: string;
  footerGlow: string;
}

/* 24h sky palette — 11 keyframes interpolated (verbatim from eve0415.net v3). */
const RAW: readonly [RawStop, ...RawStop[]] = [
  {
    t: 0,
    hero: ['#01010e', '#0a0533', '#1c1060', '#3a1d7a', '#6a2f95', '#8e46d9'],
    root: ['#05021c', '#0a0530', '#100a3f'],
    cl: '#eee0ff',
    cs: '#8a46c8',
    cd: '#2a1670',
    na: '#8e46d9',
    nb: '#27198d',
    star: 1,
    day: 0,
    inkT: '#fcf7fd',
    inkK: '#9fe8ff',
    inkS: '#e9e4ff',
  },
  {
    t: 4.5,
    hero: ['#020617', '#081234', '#122a5e', '#274787', '#3f6aa8', '#6f9cc8'],
    root: ['#04081f', '#0a1638', '#122448'],
    cl: '#d8e2f8',
    cs: '#5f7ab8',
    cd: '#1c2a66',
    na: '#4a5ac8',
    nb: '#1c2a7a',
    star: 0.85,
    day: 0,
    inkT: '#fcf7fd',
    inkK: '#9fe8ff',
    inkS: '#e9e4ff',
  },
  {
    t: 6.5,
    hero: ['#021224', '#0a2340', '#125a6b', '#1f8a8a', '#63b8ac', '#9fd8cf'],
    root: ['#030b26', '#0a2340', '#123a52'],
    cl: '#ffe4cf',
    cs: '#d886a8',
    cd: '#4a3a7a',
    na: '#04b0ec',
    nb: '#27198d',
    star: 0.45,
    day: 0,
    inkT: '#fcf7fd',
    inkK: '#c8f0e8',
    inkS: '#eef6ff',
  },
  {
    t: 9,
    hero: ['#1b64b4', '#2e7cc8', '#4f9ada', '#7cb8e8', '#a8d4f2', '#cfe8fa'],
    root: ['#1f568f', '#2c6ba6', '#3a7ab2'],
    cl: '#ffffff',
    cs: '#a8c4e0',
    cd: '#5c86b8',
    na: '#7cb8e8',
    nb: '#4a7ab8',
    star: 0,
    day: 1,
    inkT: '#fcf7fd',
    inkK: '#9fe8ff',
    inkS: '#e9e4ff',
  },
  {
    t: 13,
    hero: ['#1a6ac0', '#2b80d4', '#4f9ce2', '#82bdee', '#b4dcf6', '#e2f2fc'],
    root: ['#2a6aa4', '#3578b2', '#428ac0'],
    cl: '#ffffff',
    cs: '#b6cfe6',
    cd: '#6e94be',
    na: '#8ec8f0',
    nb: '#5588c0',
    star: 0,
    day: 1,
    inkT: '#fcf7fd',
    inkK: '#9fe8ff',
    inkS: '#e9e4ff',
  },
  {
    t: 16.5,
    hero: ['#1e5ea8', '#3272bc', '#5e94cc', '#94b8d8', '#c8cfd8', '#ecd9bc'],
    root: ['#245a94', '#31699e', '#3f76a4'],
    cl: '#fff6e8',
    cs: '#c0aec6',
    cd: '#7678a8',
    na: '#e8b878',
    nb: '#5578b0',
    star: 0,
    day: 1,
    inkT: '#fcf7fd',
    inkK: '#9fe8ff',
    inkS: '#e9e4ff',
  },
  {
    t: 17.4,
    hero: ['#1e517e', '#33689f', '#5d86b4', '#8fa6c0', '#c2b4b8', '#f0c493'],
    root: ['#20517e', '#2c6090', '#3a6e9e'],
    cl: '#fff0d8',
    cs: '#c9a0b0',
    cd: '#6a5b98',
    na: '#f0a878',
    nb: '#4a6aa8',
    star: 0,
    day: 1,
    inkT: '#fcf7fd',
    inkK: '#9fe8ff',
    inkS: '#e9e4ff',
  },
  {
    t: 17.9,
    hero: ['#1c2a56', '#3b3a74', '#6f4a80', '#a85a78', '#d87862', '#f8a058'],
    root: ['#182247', '#282a5c', '#3a2f6a'],
    cl: '#ffd8ac',
    cs: '#d08090',
    cd: '#503579',
    na: '#e87c84',
    nb: '#4a3a78',
    star: 0.15,
    day: 0,
    inkT: '#fff4ea',
    inkK: '#ffd9a8',
    inkS: '#ffe8d8',
  },
  {
    t: 18.5,
    hero: ['#1c2350', '#43336e', '#7a4478', '#b85a74', '#e8825e', '#ffb04e'],
    root: ['#141c44', '#252055', '#392a64'],
    cl: '#ffcf9e',
    cs: '#d87888',
    cd: '#4f3178',
    na: '#e86a8a',
    nb: '#43336e',
    star: 0.3,
    day: 0,
    inkT: '#fff4ea',
    inkK: '#ffd9a8',
    inkS: '#ffe8d8',
  },
  {
    t: 20.5,
    hero: ['#0a0224', '#2a0f52', '#4a1d7a', '#7a2f90', '#a83bb0', '#c449d0'],
    root: ['#0a0224', '#1a0b45', '#2a1058'],
    cl: '#f4d8ff',
    cs: '#b060c8',
    cd: '#3a1670',
    na: '#c449d0',
    nb: '#7a2f90',
    star: 0.8,
    day: 0,
    inkT: '#fcf7fd',
    inkK: '#ffd9ec',
    inkS: '#f4e8ff',
  },
  {
    t: 22.5,
    hero: ['#02010f', '#0a0538', '#1a0e58', '#33197a', '#57289a', '#7a3ac0'],
    root: ['#04021a', '#090434', '#0e0842'],
    cl: '#e4d4ff',
    cs: '#7e42bc',
    cd: '#251264',
    na: '#7a3ac0',
    nb: '#231788',
    star: 1,
    day: 0,
    inkT: '#fcf7fd',
    inkK: '#9fe8ff',
    inkS: '#e9e4ff',
  },
];

const hex = (value: string): Rgb => {
  const h = value.replace('#', '');
  return [Number.parseInt(h.slice(0, 2), 16), Number.parseInt(h.slice(2, 4), 16), Number.parseInt(h.slice(4, 6), 16)];
};

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

const rgb = (x: Rgb) => `rgb(${x.join(',')})`;
const rgba = (x: Rgb, alpha: number) => `rgba(${x.join(',')},${alpha})`;

const toStop = (p: RawStop): PaletteStop => ({
  t: p.t,
  hero: [hex(p.hero[0]), hex(p.hero[1]), hex(p.hero[2]), hex(p.hero[3]), hex(p.hero[4]), hex(p.hero[5])],
  root: [hex(p.root[0]), hex(p.root[1]), hex(p.root[2])],
  cl: hex(p.cl),
  cs: hex(p.cs),
  cd: hex(p.cd),
  na: hex(p.na),
  nb: hex(p.nb),
  star: p.star,
  day: p.day,
  inkT: hex(p.inkT),
  inkK: hex(p.inkK),
  inkS: hex(p.inkS),
});

const FIRST = toStop(RAW[0]);
/** Midnight again, so 22.5 → 24 interpolates back into the first keyframe. */
const LAST = toStop({ ...RAW[0], t: 24 });
const PAL: readonly PaletteStop[] = [FIRST, ...RAW.slice(1).map(stop => toStop(stop)), LAST];

/** Interpolated palette at a 0–24h clock value. Returns rgb triplets + star/day scalars. */
export const skyPalette = (clock: number): SkyPalette => {
  const c = (((Number.isFinite(clock) ? clock : 0) % 24) + 24) % 24;
  let a = FIRST;
  let b = LAST;
  for (let i = 0; i < PAL.length - 1; i++) {
    const lo = PAL[i];
    const hi = PAL[i + 1];
    if (lo === undefined || hi === undefined) continue;
    if (c >= lo.t && c <= hi.t) {
      a = lo;
      b = hi;
      break;
    }
  }
  const t = (c - a.t) / Math.max(0.001, b.t - a.t);
  const m = (x: Rgb, y: Rgb) => mix(x, y, t);
  return {
    hero: [
      m(a.hero[0], b.hero[0]),
      m(a.hero[1], b.hero[1]),
      m(a.hero[2], b.hero[2]),
      m(a.hero[3], b.hero[3]),
      m(a.hero[4], b.hero[4]),
      m(a.hero[5], b.hero[5]),
    ],
    root: [m(a.root[0], b.root[0]), m(a.root[1], b.root[1]), m(a.root[2], b.root[2])],
    cl: m(a.cl, b.cl),
    cs: m(a.cs, b.cs),
    cd: m(a.cd, b.cd),
    na: m(a.na, b.na),
    nb: m(a.nb, b.nb),
    star: a.star + (b.star - a.star) * t,
    day: a.day + (b.day - a.day) * t,
    inkT: m(a.inkT, b.inkT),
    inkK: m(a.inkK, b.inkK),
    inkS: m(a.inkS, b.inkS),
  };
};

const gradient = (parts: readonly (readonly [Rgb, number])[]) => `linear-gradient(180deg, ${parts.map(([color, pos]) => `${rgb(color)} ${pos}%`).join(', ')})`;

/** Ready-to-use CSS strings for a clock value (backgrounds + ink colors). */
export const skyCss = (clock: number): SkyCss => {
  const p = skyPalette(clock);
  const { day } = p;
  return {
    rootBg: gradient([
      [p.root[0], 0],
      [p.root[1], 55],
      [p.root[2], 100],
    ]),
    heroBg: gradient([
      [p.hero[0], 0],
      [p.hero[1], 32],
      [p.hero[2], 60],
      [p.hero[3], 78],
      [p.hero[4], 90],
      [p.hero[5], 100],
    ]),
    nebulaBg: `radial-gradient(90vw 55vh at 80% 90vh, ${rgba(p.na, 0.2)}, transparent 65%), radial-gradient(80vw 45vh at 6% 125vh, ${rgba(p.nb, 0.42)}, transparent 68%), radial-gradient(100vw 42vh at 50% 12vh, ${rgba(p.nb, 0.32)}, transparent 70%), radial-gradient(120vw 50vh at 50% 100%, ${rgba(p.na, 0.1)}, transparent 70%)`,
    starAlpha: Number(p.star.toFixed(3)),
    inkTitle: rgb(mix(p.inkT, [10, 36, 64], day)),
    inkKicker: rgb(mix(p.inkK, [8, 58, 92], day)),
    inkSub: rgb(mix(p.inkS, [18, 48, 80], day)),
    footerGlow: `radial-gradient(120% 220% at 50% 135%, ${rgba(p.na, 0.16)}, transparent 60%)`,
  };
};

interface SkyBackgroundProps {
  timeOfDay?: number;
  stars?: number;
  minHeight?: number | string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export const SkyBackground: FC<SkyBackgroundProps> = ({ timeOfDay = 0, stars = 60, minHeight = 200, className, style, children }) => {
  const sky = skyCss(timeOfDay);
  return (
    <div className={cn('relative overflow-hidden font-sans', className)} style={{ background: sky.rootBg, minHeight, ...style }}>
      <div aria-hidden='true' className='pointer-events-none absolute inset-0' style={{ background: sky.nebulaBg }} />
      {stars > 0 ? <StarField count={stars} style={{ opacity: sky.starAlpha }} /> : null}
      <div className='relative'>{children}</div>
    </div>
  );
};
