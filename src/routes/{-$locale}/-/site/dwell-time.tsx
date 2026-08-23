import type { Locale } from '#i18n/locale';
import type { FC } from 'react';

import { useEffect, useState } from 'react';

import { SITE_COPY } from '#i18n/copy';

/** How long the comp waits before the line is worth showing at all. */
const FLOOR_MINUTES = 1;
const TICK_MS = 30_000;
const MS_PER_MINUTE = 60_000;

/**
 * `Intl.DurationFormat` is Baseline *newly* available, so it is described here
 * and reached only behind the guard — which proves the constructor is there
 * rather than asserting it. TypeScript's own `Intl` namespace does not declare
 * it yet at the lib level this project targets.
 */
interface DurationParts {
  hours?: number;
  minutes: number;
}

interface DurationFormatHost {
  DurationFormat: new (locales: string, options: { style: 'long' }) => { format: (duration: DurationParts) => string };
}

const hasDurationFormat = (intl: typeof Intl): intl is typeof Intl & DurationFormatHost =>
  'DurationFormat' in intl && typeof intl.DurationFormat === 'function';

const spell = (locale: Locale, hours: number, minutes: number): string => {
  if (hasDurationFormat(Intl)) {
    return new Intl.DurationFormat(locale, { style: 'long' }).format(hours > 0 ? { hours, minutes } : { minutes });
  }

  const copy = SITE_COPY[locale];
  const tail = `${minutes} ${copy.dwellMinutes}`;

  return hours > 0 ? `${hours} ${copy.dwellHours} ${tail}` : tail;
};

/**
 * The footer's "how long you have been here" line.
 *
 * Client-only by construction: it reads a clock, and the prerender has no
 * honest answer for one. So it renders nothing until an effect has started
 * counting — which is also the correct prerendered state, because the comp
 * hides the line for the first minute anyway.
 */
export const DwellTime: FC<{ locale: Locale }> = ({ locale }) => {
  const [minutes, setMinutes] = useState<number | null>(null);

  useEffect(() => {
    const arrived = Date.now();
    const tick = () => {
      setMinutes(Math.floor((Date.now() - arrived) / MS_PER_MINUTE));
    };

    tick();
    const id = setInterval(tick, TICK_MS);

    return () => {
      clearInterval(id);
    };
  }, []);

  if (minutes === null || minutes < FLOOR_MINUTES) return null;

  return (
    <span className='ml-auto opacity-90'>
      {SITE_COPY[locale].dwellPrefix} {spell(locale, Math.floor(minutes / 60), minutes % 60)}
    </span>
  );
};
