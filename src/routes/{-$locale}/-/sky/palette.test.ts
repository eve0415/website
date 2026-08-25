import { describe, expect, it } from 'vitest';

import { MIDNIGHT, skyCss, skyCssText, skyIsDay, skyVars } from './palette';

/**
 * The `t` of every authored keyframe in `RAW`, plus the 24時 wrap `PAL` closes
 * on. `RAW` is not exported and does not need to be — this list mirrors it, so a
 * keyframe added there wants adding here.
 */
const KEYFRAMES = [0, 4.5, 6.5, 9, 13, 16.5, 17.4, 17.9, 18.5, 20.5, 22.5, 24];

/**
 * Every keyframe and the midpoint between neighbours. The keyframes are the
 * authored values and mostly cannot be wrong; the midpoints are interpolation,
 * which is where a bad value actually appears.
 */
const SAMPLES = KEYFRAMES.flatMap((t, i) => {
  const next = KEYFRAMES[i + 1];
  return next === undefined ? [t] : [t, (t + next) / 2];
});

/** `SkyClock` tweens `day` from 0 to 1 across the switch, so the middle of it ships too. */
const DAYS = [0, 0.25, 0.5, 0.75, 1];

/**
 * The clocks whose ±24 arithmetic survives a double exactly. `16.95 - 24 + 24`
 * does not come back as `16.95`, and that drift moves a rounded channel by 1 —
 * so the exact-periodicity claim is made on the quarter hours only.
 */
const EXACT = SAMPLES.filter(t => Number.isInteger(t * 4));

/**
 * The whole dial at 0.01h. The dusk deadband is about 0.05h wide, so a coarser
 * step walks straight over it and the hysteresis tests go vacuous.
 */
const DIAL = Array.from({ length: 2401 }, (_, i) => i / 100);

/** The clocks where the two hysteresis thresholds disagree — the switching deadband itself. */
const DEADBAND = DIAL.filter(clock => skyIsDay(clock, true) !== skyIsDay(clock, false));

/** Everything one clock value puts on the page: the object form, the custom properties, and the rule text. */
const emitted = (clock: number, day: number): [string, string][] => {
  const sky = skyCss(clock, day);
  const at = `${clock}h day ${day}`;
  return [
    ...Object.entries(sky).map(([name, value]): [string, string] => [`${at} ${name}`, String(value)]),
    ...Object.entries(skyVars(sky)).map(([name, value]): [string, string] => [`${at} ${name}`, value]),
    [`${at} cssText`, skyCssText(sky)],
  ];
};

/** What a broken number looks like once it has been stringified into CSS. */
const NOT_A_VALUE = /NaN|undefined|Infinity/;

/**
 * Every way one emitted string can be unusable in a `<style>` block, as
 * reportable lines. Accumulated rather than asserted per value: a loop of
 * conditional `expect`s reports the first break and nothing about the rest.
 */
const defects = (label: string, value: string): string[] => {
  const found = NOT_A_VALUE.test(value) ? [`${label}: ${value}`] : [];
  for (const match of value.matchAll(/rgba?\(([^)]*)\)/g)) {
    const [, body] = match;
    if (body === undefined) {
      found.push(`${label}: unparsable colour`);
      continue;
    }
    const parts = body.split(',');
    if (parts.length !== 3 && parts.length !== 4) found.push(`${label}: ${parts.length} components in (${body})`);
    for (const part of parts.slice(0, 3)) {
      const channel = Number(part);
      if (!Number.isInteger(channel) || channel < 0 || channel > 255) found.push(`${label}: channel ${part} in (${body})`);
    }
    for (const trailing of parts.slice(3)) {
      const alpha = Number(trailing);
      if (!(alpha >= 0 && alpha <= 1)) found.push(`${label}: alpha ${trailing} in (${body})`);
    }
  }
  return found;
};

/** The two bare 0–1 scalars `SkyCss` hands out, labelled for a readable failure. */
const scalars = (clock: number, day: number): [string, number][] => {
  const sky = skyCss(clock, day);
  return [
    [`${clock}h day ${day} starAlpha`, sky.starAlpha],
    [`${clock}h day ${day} vignette`, sky.vignette],
  ];
};

describe('MIDNIGHT', () => {
  it('is the 深夜 0時 sky every page prerenders', () => {
    expect(skyCss(0, 0)).toStrictEqual(MIDNIGHT);
  });

  /*
   * The one pair that actually ships: `__root.tsx` writes `skyCssText(MIDNIGHT)`
   * into the prerendered document and `SkyClock` recomputes the same clock in the
   * browser. A difference here is a hydration mismatch on all 20 pages.
   */
  it('recomputes to the same rule text on the client as the one prerendered', () => {
    expect(skyCssText(skyCss(0, 0))).toBe(skyCssText(MIDNIGHT));
  });
});

describe('skyCss', () => {
  it('returns deep-equal results for repeated identical arguments', () => {
    const drift = SAMPLES.flatMap(clock =>
      DAYS.filter(day => {
        const first = skyCssText(skyCss(clock, day));
        const again = skyCssText(skyCss(clock, day));
        return first !== again;
      }).map(day => `${clock}h day ${day}`),
    );
    expect({ samples: SAMPLES.length, drift }).toStrictEqual({ samples: 23, drift: [] });
  });

  it('emits nothing malformed at any keyframe or midpoint', () => {
    const found = SAMPLES.flatMap(clock => DAYS.flatMap(day => emitted(clock, day).flatMap(([label, value]) => defects(label, value))));
    expect({ samples: SAMPLES.length, found }).toStrictEqual({ samples: 23, found: [] });
  });

  it('keeps the bare scalars inside 0–1', () => {
    const out = SAMPLES.flatMap(clock =>
      DAYS.flatMap(day =>
        scalars(clock, day)
          .filter(([, value]) => !(value >= 0 && value <= 1))
          .map(([label]) => label),
      ),
    );
    expect({ samples: SAMPLES.length, out }).toStrictEqual({ samples: 23, out: [] });
  });

  /* The triplet is the same ink as the `rgb()` form; a border tinted from a stale one is off by a hue. */
  it('keeps the bare title triplet in step with its rgb() form', () => {
    const mismatched = SAMPLES.flatMap(clock =>
      DAYS.filter(day => {
        const sky = skyCss(clock, day);
        return sky.inkTitle !== `rgb(${sky.inkTitleRgb})`;
      }).map(day => `${clock}h day ${day}`),
    );
    expect({ samples: SAMPLES.length, mismatched }).toStrictEqual({ samples: 23, mismatched: [] });
  });

  it('reads the clock modulo 24 hours', () => {
    const drift = EXACT.flatMap(clock =>
      DAYS.flatMap(day => {
        const here = skyCssText(skyCss(clock, day));
        return [24, -24, 48, -48].filter(offset => skyCssText(skyCss(clock + offset, day)) !== here).map(offset => `${clock}h day ${day} ${offset}`);
      }),
    );
    expect({ clocks: EXACT.length, drift }).toStrictEqual({ clocks: 18, drift: [] });
  });

  it('falls back to midnight for a clock that is not finite', () => {
    expect({
      nan: skyCss(Number.NaN, 0),
      positive: skyCss(Number.POSITIVE_INFINITY, 0),
      negative: skyCss(Number.NEGATIVE_INFINITY, 0),
    }).toStrictEqual({ nan: MIDNIGHT, positive: MIDNIGHT, negative: MIDNIGHT });
  });
});

describe('skyCssText', () => {
  /*
   * Names, order and values in one assertion, parsed back out rather than
   * substring-matched: `--sky-ink-title` is a prefix of `--sky-ink-title-rgb`,
   * so an `includes` check still passes when the shorter one has been dropped.
   */
  it('declares exactly the properties skyVars produces', () => {
    const text = skyCssText(MIDNIGHT);
    const inner = text.slice(':root{'.length, -1);
    expect({ wrapped: text.startsWith(':root{') && text.endsWith('}'), declarations: inner.split(';') }).toStrictEqual({
      wrapped: true,
      declarations: Object.entries(skyVars(MIDNIGHT)).map(([name, value]) => `${name}:${value}`),
    });
  });

  it('honours the selector it is given and defaults to :root', () => {
    const fallback = skyCssText(MIDNIGHT);
    const named = skyCssText(MIDNIGHT, '.ev-sky-probe');
    expect({
      fallbackPrefix: fallback.startsWith(':root{'),
      namedPrefix: named.startsWith('.ev-sky-probe{'),
      sameBody: fallback.slice(':root{'.length) === named.slice('.ev-sky-probe{'.length),
    }).toStrictEqual({ fallbackPrefix: true, namedPrefix: true, sameBody: true });
  });
});

describe('skyIsDay', () => {
  it.each([
    ['深夜', 0, false],
    ['夜明け前', 4.5, false],
    ['薄明', 6.5, false],
    ['朝', 9, true],
    ['正午過ぎ', 13, true],
    ['夕方', 16.5, true],
    ['日没直後', 18.5, false],
    ['夜', 22.5, false],
  ])('reads %s the same way whatever the prior state was', (_label, clock, expected) => {
    expect([skyIsDay(clock), skyIsDay(clock, true), skyIsDay(clock, false)]).toStrictEqual([expected, expected, expected]);
  });

  /*
   * The anti-flapping property, and the one a refactor to a single threshold
   * silently removes: inside the band the prior state is kept, not recomputed.
   * Asserted on both ends of the day, since dawn and dusk each have one.
   */
  it('retains the prior state inside the switching deadband', () => {
    const wrong = DEADBAND.filter(clock => !(skyIsDay(clock, true) && !skyIsDay(clock, false)));
    expect({
      dawn: DEADBAND.some(clock => clock < 12),
      dusk: DEADBAND.some(clock => clock >= 12),
      wrong,
    }).toStrictEqual({ dawn: true, dusk: true, wrong: [] });
  });

  /*
   * With no prior state there is one threshold, and it sits between the two
   * hysteresis ones: whatever the night branch calls day is day, and whatever
   * this calls day the day branch keeps. Pins the nesting without pinning an hour.
   */
  it('sits its no-history reading between the two hysteresis thresholds', () => {
    const inverted = DIAL.filter(clock => (skyIsDay(clock, false) && !skyIsDay(clock)) || (skyIsDay(clock) && !skyIsDay(clock, true)));
    expect({ scanned: DIAL.length, inverted }).toStrictEqual({ scanned: 2401, inverted: [] });
  });

  it('reads the clock modulo 24 hours', () => {
    const drift = SAMPLES.flatMap(clock =>
      [24, -24].flatMap(offset =>
        [undefined, true, false].filter(was => skyIsDay(clock, was) !== skyIsDay(clock + offset, was)).map(was => `${clock}h ${offset} was ${String(was)}`),
      ),
    );
    expect({ samples: SAMPLES.length, drift }).toStrictEqual({ samples: 23, drift: [] });
  });

  it('reads a clock that is not finite as night', () => {
    expect({
      nan: skyIsDay(Number.NaN),
      positive: skyIsDay(Number.POSITIVE_INFINITY, true),
      negative: skyIsDay(Number.NEGATIVE_INFINITY, false),
    }).toStrictEqual({ nan: false, positive: false, negative: false });
  });
});
