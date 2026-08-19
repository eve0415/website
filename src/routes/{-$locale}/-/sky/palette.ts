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

/**
 * Ready-to-use CSS strings for a clock value.
 *
 * The `ink*` and chrome fields carry the day mix as well as the clock: the sky
 * turns blue between roughly 7時 and 18時, and everything sitting straight on
 * it has to turn dark to stay legible. Glass panels and their contents do not
 * appear here — they stay night-coloured all day, which is what keeps their
 * light text readable over a bright sky.
 */
export interface SkyCss {
  rootBg: string;
  heroBg: string;
  nebulaBg: string;
  starAlpha: number;
  footerGlow: string;
  /** The cloud sea, lit front to back. */
  cloudBack: string;
  cloudMid: string;
  cloudFront: string;
  catGlow: string;
  /** Lights inside the cloud sea: nebula, cloud shade, white core. */
  glowA: string;
  glowB: string;
  glowW: string;
  /** The dimmer set that bridges the hero into the page below it. */
  glowMidA: string;
  glowMidB: string;
  glowMidC: string;
  inkTitle: string;
  /** Title ink as a bare `r,g,b` triplet, for tinting a border or a shadow. */
  inkTitleRgb: string;
  inkKicker: string;
  inkSub: string;
  inkNav: string;
  inkFaint: string;
  inkShadow: string;
  headerBg: string;
  headerLine: string;
  glassBg: string;
  accent: string;
  link: string;
  /**
   * The ghost button's two moving parts. A pill with no fill cannot clear AA on
   * the noon sky at any tint — the sky's own luminance sits in the middle of the
   * range — so on its way into daylight it picks up the glass fill and the dark
   * on-sky ink. Both are exactly the design's night values at day 0.
   */
  ghostSurface: string;
  ghostInk: string;
}

/* 24h sky palette — 11 keyframes interpolated (verbatim from eve0415.net v3). */
const RAW = [
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
] as const satisfies RawStop[];

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

const channel = (v: number) => {
  const x = v / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
};

const luminance = (c: Rgb) => 0.2126 * channel(c[0]) + 0.7152 * channel(c[1]) + 0.0722 * channel(c[2]);

/**
 * Whether the clock reads as daytime, from how bright the middle of the hero
 * gradient is. The two thresholds are a deliberate deadband: dawn and dusk pass
 * through the switching brightness slowly, and a single threshold would flip the
 * whole page's ink back and forth for minutes on end.
 */
export const skyIsDay = (clock: number, wasDay?: boolean): boolean => {
  const p = skyPalette(clock);
  const level = luminance(mix(p.hero[2], p.hero[3], 0.5));
  if (wasDay === undefined) return level > 0.275;
  return wasDay ? level >= 0.262 : level > 0.288;
};

/**
 * Ready-to-use CSS strings for a clock value.
 *
 * `day` is passed in rather than read off the palette because the two move at
 * different speeds: the clock is tweened across the change, while the day mix
 * is its own 0→1 crossfade driven by `skyIsDay`.
 */
export const skyCss = (clock: number, day: number): SkyCss => {
  const p = skyPalette(clock);
  const inkT = mix(p.inkT, [10, 36, 64], day);

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
    footerGlow: `radial-gradient(120% 220% at 50% 135%, ${rgba(p.na, 0.16)}, transparent 60%)`,
    cloudBack: `radial-gradient(circle at 38% 26%, ${rgba(mix(p.cl, p.cs, 0.55), 0.85)}, ${rgba(p.cs, 0.88)} 56%, ${rgba(p.cd, 0.92)} 95%)`,
    cloudMid: `radial-gradient(circle at 36% 24%, ${rgba(p.cl, 0.92)}, ${rgba(mix(p.cl, p.cs, 0.45), 0.88)} 52%, ${rgba(p.cs, 0.84)} 92%)`,
    cloudFront: `radial-gradient(circle at 35% 23%, ${rgba(p.cl, 0.96)}, ${rgba(mix(p.cl, p.cs, 0.3), 0.92)} 52%, ${rgba(mix(p.cs, p.cd, 0.3), 0.82)} 92%)`,
    catGlow: `radial-gradient(closest-side, ${rgba(p.cl, 0.42)}, ${rgba(p.cs, 0.16)} 58%, transparent 76%)`,
    glowA: rgba(p.na, 0.5),
    glowB: rgba(p.cs, 0.5),
    glowW: rgba(p.cl, 0.28),
    glowMidA: rgba(p.cs, 0.28),
    glowMidB: rgba(p.na, 0.2),
    glowMidC: rgba(p.nb, 0.5),
    inkTitle: rgb(inkT),
    inkTitleRgb: inkT.join(','),
    inkKicker: rgb(mix(p.inkK, [8, 58, 92], day)),
    inkSub: rgb(mix(p.inkS, [18, 48, 80], day)),
    inkNav: rgb(mix([234, 230, 255], [18, 51, 80], day)),
    inkFaint: rgb(mix([164, 157, 216], [24, 52, 88], day)),
    inkShadow: rgba(mix([3, 1, 20], [250, 250, 255], day), Number((0.6 - 0.25 * day).toFixed(2))),
    headerBg: rgba(mix([5, 2, 28], [240, 246, 252], day), 0.55),
    headerLine: rgba(mix([160, 150, 255], [30, 60, 100], day), 0.18),
    glassBg: rgba(mix([5, 2, 28], [255, 255, 255], day), 0.32),
    accent: rgb(mix([4, 254, 255], [10, 74, 140], day)),
    ghostSurface: rgba(mix([5, 2, 28], [255, 255, 255], day), Number((0.32 * day).toFixed(3))),
    ghostInk: rgb(mix([143, 233, 255], inkT, day)),
    /* The design fades the link to #ebf6ff by day, which lands at 4.22:1 on its
       own noon sky — the blue is bright enough that only pure white clears AA
       for small text, so that is where this one goes. */
    link: rgb(mix([159, 232, 255], [255, 255, 255], day)),
  };
};

/** The custom properties `__root.css` reads the whole scene through. */
export const skyVars = (sky: SkyCss) => ({
  '--sky-root': sky.rootBg,
  '--sky-hero': sky.heroBg,
  '--sky-nebula': sky.nebulaBg,
  '--sky-star-alpha': String(sky.starAlpha),
  '--sky-footer-glow': sky.footerGlow,
  '--sky-cloud-back': sky.cloudBack,
  '--sky-cloud-mid': sky.cloudMid,
  '--sky-cloud-front': sky.cloudFront,
  '--sky-cat-glow': sky.catGlow,
  '--sky-glow-a': sky.glowA,
  '--sky-glow-b': sky.glowB,
  '--sky-glow-w': sky.glowW,
  '--sky-glow-mid-a': sky.glowMidA,
  '--sky-glow-mid-b': sky.glowMidB,
  '--sky-glow-mid-c': sky.glowMidC,
  '--sky-ink-title': sky.inkTitle,
  '--sky-ink-title-rgb': sky.inkTitleRgb,
  '--sky-ink-kicker': sky.inkKicker,
  '--sky-ink-sub': sky.inkSub,
  '--sky-ink-nav': sky.inkNav,
  '--sky-ink-faint': sky.inkFaint,
  '--sky-ink-shadow': sky.inkShadow,
  '--sky-header-bg': sky.headerBg,
  '--sky-header-line': sky.headerLine,
  '--sky-glass-bg': sky.glassBg,
  '--sky-accent': sky.accent,
  '--sky-link': sky.link,
  '--sky-ghost-surface': sky.ghostSurface,
  '--sky-ghost-ink': sky.ghostInk,
});

/** The same properties as one rule, for a stylesheet the document prerenders. */
export const skyCssText = (sky: SkyCss, selector = ':root') =>
  `${selector}{${Object.entries(skyVars(sky))
    .map(([name, value]) => `${name}:${value}`)
    .join(';')}}`;

/** 深夜 0時 — the design's canonical state, and what every page prerenders. */
export const MIDNIGHT = skyCss(0, 0);
