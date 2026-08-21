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
interface SkyPalette {
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
 *
 * That last sentence is only true because `.ev-on-panel` in `__root.css` pins
 * the panel *surfaces* opaque as well as the ink. While they were translucent
 * the sky composited straight through them and the claim was false for eleven
 * hours a day; the two have to stay in step.
 */
export interface SkyCss {
  rootBg: string;
  heroBg: string;
  nebulaBg: string;
  starAlpha: number;
  /**
   * The hero vignette's alpha. It darkens the top and bottom of the hero, which
   * is depth at night behind pale ink and lost contrast behind dark ink — so it
   * follows the cloud band down to nothing at noon. The cloud band, not `day`:
   * `day` saturates from 8時半 to 17時半, and the band is what the sub is read on.
   */
  vignette: number;
  /**
   * The wash the hero copy is read on.
   *
   * The copy ink flips with the clock, near-black by day and pale at night, so
   * a scrim under it has to flip too or it walks the band into the ink instead
   * of away from it. Colour and alpha both come from here. By day it hands back
   * a share of what the vignette took, since that is where most of the gap it
   * fills came from; at night it is a whisper of the same indigo, the other way.
   */
  scrim: string;
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
  /**
   * The ring `:focus-visible` draws, for the band that turns bright by day.
   * The neon owns the night and is 1.8:1 against the header glass at noon, so
   * it hands over to the same navy the ink does — a ring owes 3:1 to whatever
   * it replaced (WCAG 1.4.11), which on that band is the glass or the hero sky.
   */
  focusRing: string;
  link: string;
  /**
   * The same inks for text on the plain sky rather than over the cloud sea.
   * That band is roughly half the brightness, and the direction reverses with
   * it: dark ink clears AA over the clouds and the header glass, pale ink
   * clears it on the open sky, and neither clears both.
   *
   * These read the page band's own luminance rather than `day`, which saturates
   * at 1 for eleven hours while the band keeps moving under them — and starts
   * before it, since the band passes the level the night inks can carry at
   * around 6時半, two hours before `skyIsDay` turns over.
   */
  paleTitle: string;
  paleIce: string;
  paleBody: string;
  paleMuted: string;
  paleFaint: string;
  /** The neon, kept as an accent on the open sky by paling rather than darkening. */
  paleCyan: string;
  /**
   * How far the project hues are washed toward white, as a `color-mix` amount.
   * They are authored in `__root.css` and only move here: a 12px tag owes 4.5:1
   * and the darkest of them cannot reach it on the daylight band unpaled.
   */
  wash: string;
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
const skyPalette = (clock: number): SkyPalette => {
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
 * The brightest the open sky behind the page is allowed to get.
 *
 * `.ev-on-sky` carries pale ink, and pale ink owing 4.5:1 runs out at a backdrop
 * of 0.183 even at pure white — the neon of the 12px project-hue tags it also
 * carries runs out at 0.12, and the other three hues only reach it washed. The
 * page gradient reached 0.231 at 13時 and the glows over it 0.27, so the ink was
 * being asked for a brightness it does not have. The band is held here instead,
 * which is also what keeps one polarity for the whole 24h: dark ink on the page
 * needs 0.175 or brighter, and dusk drops it to 0.09 whatever we do.
 */
const PAGE_CEILING = 0.12;

/**
 * Where the page band starts to matter to the ink on it: the level at which the
 * night `--ink-faint` stops clearing 4.5:1. Below it the night inks stand.
 */
const PAGE_DIM = 0.04;

/**
 * The cloud band's own luminance at the two ends of the daylight it carries:
 * 17時半, where `day` hands back over, and 13時. Its ink is dark, so it has to
 * deepen as the band falls — the opposite of the page band's, and the reason
 * one `day` flag cannot drive both.
 */
const CLOUD_DUSK = 0.15;
const CLOUD_NOON = 0.26;

/**
 * The two halves of the hero copy scrim, as alphas.
 *
 * The daylight half is read off the vignette rather than off its own ramp: the
 * band the vignette darkens is the same band the near-black ink is read on, and
 * at dusk it takes 1.3 of contrast the greeting does not have. Sized in the
 * vignette's units, one number keeps the two in step at every clock between.
 * Not all of it: the copy clears 4.5:1 well before the vignette is undone, and
 * every point past that is scrim somebody can see.
 *
 * `SCRIM_DAY` is the part that is not the vignette. At 13時 the vignette is
 * already down to 0.015 and the copy is still 0.08 short on a 320px screen,
 * because a short hero puts it over a brighter run of sky; that is what this
 * covers, and at 2% of white it is under the rounding of the gradient it sits
 * on.
 */
const SCRIM_DAY = 0.02;
const SCRIM_GIVEBACK = 0.68;

/**
 * The night half, which is the same indigo going the other way.
 *
 * The night band is nearly dark enough for pale ink on its own. What it is not
 * dark enough for is the brightest puff of the back cloud layer, which crosses
 * the sub on a short viewport and only there: 4.38 at 375x667 against 5.58 at
 * 1280x800. This is sized on that puff, to the same headroom over 4.5:1 that
 * the daylight half carries.
 */
const SCRIM_NIGHT = 0.06;

/**
 * The band the hero copy is actually read on, at the two levels that decide
 * whether the cloud sea has to fall into shadow.
 *
 * The copy is bottom-aligned in a full-height hero, so what sits behind it is
 * the low end of the hero gradient rather than the middle `skyIsDay` reads off.
 * That band runs 0.05 at 深夜 and 0.30 at 17時40, and it is the 深夜 end that has
 * to come out untouched: `MIDNIGHT` is what every page prerenders.
 */
const HERO_NIGHT = 0.09;
const HERO_DUSK = 0.17;

/**
 * How far the cloud sea falls toward its own deep tone at dusk.
 *
 * The cloud tones are authored for the light of their hour, and at dusk `cl` is
 * a near-white cream at 0.80. The back layer's low puffs cross the hero sub and
 * the front layer's cross the glass CTA, where they measured 0.29 and 0.22 —
 * against the 0.143 and 0.167 the pale ink they carry can clear. `SCRIM_NIGHT`
 * already answers for the same puff at 深夜, where the sky behind it is dark
 * enough that 6% of indigo covers it. At dusk the sky behind it is not, and no
 * scrim that does cover it stays invisible: 0.24 of it still left the sub at
 * 3.67 and read as a panel behind the copy.
 *
 * So the cloud goes into shadow rather than the copy being washed. `cd` is the
 * shadow side the design already authors for the same hour, which makes this a
 * cloud turning away from a sun that has gone down. Walking the tone toward
 * black reaches the same luminance and reads as mud.
 *
 * Sized on 17時30 rather than on 17時40. That is the first minute the flag
 * reads night, so it is the brightest sky the pale ink is ever asked to carry:
 * 0.7 of shadow leaves the sub at 4.38 there while clearing every later clock.
 */
const CLOUD_SHADOW = 0.85;

/** 0 below `lo`, 1 above `hi`, linear between — one scalar read off another. */
const ramp = (value: number, lo: number, hi: number) => Math.min(1, Math.max(0, (value - lo) / (hi - lo)));

/**
 * `c` walked down its own hue until what it composites to sits at or below
 * `PAGE_CEILING`: painted at `alpha` over a band already at `under`.
 *
 * The alpha is the whole point. Holding every layer's own colour to the ceiling
 * is far stricter than the ceiling asks, and it repaints the night — the design's
 * midnight nebula is #8e46d9, luminance 0.15, but it lands at 20% over a sky at
 * 0.007 and composites to 0.036. Read this way the night comes through untouched,
 * which is what `MIDNIGHT` promises, and only the daylight band is held.
 *
 * Scaling the channels is only approximately a power law — the sRGB toe bends it
 * and the rounding bends it again, by up to 14% on a desaturated colour — so the
 * step repeats against the real luminance rather than trusting one estimate, and
 * floors so that every pass is a step down.
 */
const held = (c: Rgb, alpha = 1, under = 0): Rgb => {
  const room = (PAGE_CEILING - (1 - alpha) * under) / alpha;
  let out = c;
  for (let i = 0; i < 4 && luminance(out) > room; i++) {
    const k = (room / luminance(out)) ** (1 / 2.4);
    out = [Math.floor(out[0] * k), Math.floor(out[1] * k), Math.floor(out[2] * k)];
  }
  return out;
};

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
  /* How much daylight each band is actually carrying, which is not what `day`
     says: it saturates at 1 from 8時半 to 17時半 while the page band runs 0.14 to
     0.23 and back and the cloud band 0.17 to 0.26. The page band is held at the
     ceiling, so full lift there is the brightest backdrop its pale ink ever has
     to clear; `deep` reads the other way, since dark ink on a dimming band has
     to go down with it. `day` still owns the crossfade — these only choose which
     value it lands on, so the deadband it carries is untouched. */
  const page = ramp(luminance(p.root[2]), PAGE_DIM, PAGE_CEILING);
  /* The band every translucent layer over the page composites onto, held first
     because it is the opaque one. */
  const band = luminance(held(p.root[2]));
  const cloud = ramp(luminance(mix(p.hero[1], p.hero[2], 0.5)), CLOUD_DUSK, CLOUD_NOON);
  /* The vignette alpha, hoisted because the scrim is sized in it. */
  const vignette = 0.3 * (1 - cloud);
  const deep = (dusk: Rgb, noon: Rgb) => mix(dusk, noon, cloud);
  /* The cloud sea's shadow side, on the band the copy is read on rather than on
     `day`, which saturates while that band keeps falling. `day` only gates it:
     at noon the clouds are white under near-black ink and have to stay white,
     and below that the shade follows the band down to nothing well before 深夜. */
  const shade = CLOUD_SHADOW * (1 - day) * ramp(luminance(mix(p.hero[3], p.hero[4], 0.5)), HERO_NIGHT, HERO_DUSK);
  const cl = mix(p.cl, p.cd, shade);
  const cs = mix(p.cs, p.cd, shade);
  const inkT = mix(p.inkT, deep([4, 20, 36], [10, 36, 64]), day);

  return {
    rootBg: gradient([
      [held(p.root[0]), 0],
      [held(p.root[1]), 55],
      [held(p.root[2]), 100],
    ]),
    heroBg: gradient([
      [p.hero[0], 0],
      [p.hero[1], 32],
      [p.hero[2], 60],
      [p.hero[3], 78],
      [p.hero[4], 90],
      [p.hero[5], 100],
    ]),
    nebulaBg: `radial-gradient(90vw 55vh at 80% 90vh, ${rgba(held(p.na, 0.2, band), 0.2)}, transparent 65%), radial-gradient(80vw 45vh at 6% 125vh, ${rgba(held(p.nb, 0.42, band), 0.42)}, transparent 68%), radial-gradient(100vw 42vh at 50% 12vh, ${rgba(held(p.nb, 0.32, band), 0.32)}, transparent 70%), radial-gradient(120vw 50vh at 50% 100%, ${rgba(held(p.na, 0.1, band), 0.1)}, transparent 70%)`,
    starAlpha: Number(p.star.toFixed(3)),
    vignette: Number(vignette.toFixed(3)),
    scrim: rgba(mix([5, 2, 28], [255, 255, 255], day), Number((SCRIM_NIGHT + (SCRIM_DAY + SCRIM_GIVEBACK * vignette - SCRIM_NIGHT) * day).toFixed(3))),
    footerGlow: `radial-gradient(120% 220% at 50% 135%, ${rgba(held(p.na, 0.16, band), 0.16)}, transparent 60%)`,
    cloudBack: `radial-gradient(circle at 38% 26%, ${rgba(mix(cl, cs, 0.55), 0.85)}, ${rgba(cs, 0.88)} 56%, ${rgba(p.cd, 0.92)} 95%)`,
    cloudMid: `radial-gradient(circle at 36% 24%, ${rgba(cl, 0.92)}, ${rgba(mix(cl, cs, 0.45), 0.88)} 52%, ${rgba(cs, 0.84)} 92%)`,
    cloudFront: `radial-gradient(circle at 35% 23%, ${rgba(cl, 0.96)}, ${rgba(mix(cl, cs, 0.3), 0.92)} 52%, ${rgba(mix(cs, p.cd, 0.3), 0.82)} 92%)`,
    catGlow: `radial-gradient(closest-side, ${rgba(p.cl, 0.42)}, ${rgba(p.cs, 0.16)} 58%, transparent 76%)`,
    glowA: rgba(p.na, 0.5),
    glowB: rgba(p.cs, 0.5),
    glowW: rgba(p.cl, 0.28),
    glowMidA: rgba(held(p.cs, 0.28, band), 0.28),
    glowMidB: rgba(held(p.na, 0.2, band), 0.2),
    glowMidC: rgba(held(p.nb, 0.5, band), 0.5),
    inkTitle: rgb(inkT),
    inkTitleRgb: inkT.join(','),
    /* Deeper than the design's own [8,58,92] / [18,48,80], which land at 3.16
       and 4.18 against the cloud sea they are read on. Same navy, far enough
       down it to clear AA, and deeper again at dusk: the hero copy's own
       backdrop measured 0.23 at 13時 and 0.16 at 17時半, and a fixed navy that
       clears the first misses the second by a full point. The sub ends up darker
       than the title, which looks like an inverted hierarchy and is not: at
       17.5px it owes 4.5:1 where the 74px title owes 3:1, so the smaller text
       has to carry more contrast — and the sub is the one sitting in the hero's
       own vignette, which by day subtracts 0.10 of luminance from the sky behind
       it. This ink is as deep as that band asks for; the rest of that gap is the
       scrim's, not the ink's. */
    inkKicker: rgb(mix(p.inkK, deep([0, 10, 20], [1, 16, 28]), day)),
    inkSub: rgb(mix(p.inkS, deep([0, 6, 12], [1, 10, 20]), day)),
    inkNav: rgb(mix([234, 230, 255], deep([3, 16, 30], [6, 26, 46]), day)),
    inkFaint: rgb(mix([164, 157, 216], deep([4, 20, 36], [9, 32, 56]), day)),
    inkShadow: rgba(mix([3, 1, 20], [250, 250, 255], day), Number((0.6 - 0.25 * day).toFixed(2))),
    headerBg: rgba(mix([5, 2, 28], [240, 246, 252], day), 0.55),
    headerLine: rgba(mix([160, 150, 255], [30, 60, 100], day), 0.18),
    glassBg: rgba(mix([5, 2, 28], [255, 255, 255], day), 0.32),
    /* Likewise deeper than the design's [10,74,140] — 3.74 on its own header,
       and the active language pill tints that header darker still. */
    accent: rgb(mix([4, 254, 255], deep([2, 26, 52], [3, 38, 76]), day)),
    /* Deeper than `accent`, because the ring is read against the dimmest thing
       on its band rather than the header glass: the hero CTA's own backdrop at
       17時半 is 0.16, where the accent navy lands at 2.97. */
    focusRing: rgb(mix([4, 254, 255], deep([1, 20, 40], [2, 30, 60]), day)),
    paleTitle: rgb(mix(p.inkT, [255, 255, 255], page)),
    paleIce: rgb(mix([159, 232, 255], [246, 252, 255], page)),
    paleBody: rgb(mix([233, 228, 255], [252, 250, 255], page)),
    paleMuted: rgb(mix([207, 201, 242], [248, 246, 255], page)),
    paleFaint: rgb(mix([164, 157, 216], [240, 237, 255], page)),
    paleCyan: rgb(mix([4, 254, 255], [230, 251, 255], page)),
    /* Sized on the darkest hue the open sky carries as bare 12px text — violet,
       which needs half of itself replaced by white to clear the ceiling. One
       amount for all five so the family pales together rather than splitting. */
    wash: `${Math.round(50 * page)}%`,
    ghostSurface: rgba(mix([5, 2, 28], [255, 255, 255], day), Number((0.32 * day).toFixed(3))),
    ghostInk: rgb(mix([143, 233, 255], inkT, day)),
    /* The design fades the link to #ebf6ff by day, which lands at 4.22:1 on its
       own noon sky — the blue is bright enough that only pure white clears AA
       for small text, so that is where this one goes. */
    link: rgb(mix([159, 232, 255], [255, 255, 255], page)),
  };
};

/** The custom properties `__root.css` reads the whole scene through. */
export const skyVars = (sky: SkyCss) => ({
  '--sky-root': sky.rootBg,
  '--sky-hero': sky.heroBg,
  '--sky-nebula': sky.nebulaBg,
  '--sky-star-alpha': String(sky.starAlpha),
  '--sky-vignette': String(sky.vignette),
  '--sky-scrim': sky.scrim,
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
  '--sky-focus-ring': sky.focusRing,
  '--sky-link': sky.link,
  '--sky-ghost-surface': sky.ghostSurface,
  '--sky-ghost-ink': sky.ghostInk,
  '--sky-pale-title': sky.paleTitle,
  '--sky-pale-ice': sky.paleIce,
  '--sky-pale-body': sky.paleBody,
  '--sky-pale-muted': sky.paleMuted,
  '--sky-pale-faint': sky.paleFaint,
  '--sky-pale-cyan': sky.paleCyan,
  '--sky-wash': sky.wash,
});

/** The same properties as one rule, for a stylesheet the document prerenders. */
export const skyCssText = (sky: SkyCss, selector = ':root') =>
  `${selector}{${Object.entries(skyVars(sky))
    .map(([name, value]) => `${name}:${value}`)
    .join(';')}}`;

/**
 * 深夜 0時 — the design's canonical state, and what every page prerenders.
 *
 * This is the single source of truth for the midnight sky. `__root.css` used to
 * carry a second copy as literal `--sky-*`/`--hero-*`/`--cloud-*` tokens; they
 * held the same values but nothing read them, so they were deleted rather than
 * left to drift.
 */
export const MIDNIGHT = skyCss(0, 0);
