import type { Greetings } from '#i18n/copy';
import type { Locale } from '#i18n/locale';
import type { FC } from 'react';

import { useSyncExternalStore } from 'react';

import { HOME_COPY } from '#i18n/copy';

/** 深夜, and so the line every page prerenders alongside the midnight sky. */
const LATE_NIGHT = 4;

/**
 * Which of the five sets the hour falls in. The day starts at 5時 rather than
 * at midnight: the small hours belong to the night that has not ended yet.
 */
const bucketFor = (hour: number): 0 | 1 | 2 | 3 | 4 => {
  if (hour < 5) return LATE_NIGHT;
  if (hour < 10) return 0;
  if (hour < 16) return 1;
  if (hour < 19) return 2;
  if (hour < 23) return 3;
  return LATE_NIGHT;
};

/** Which of the three lines, drawn once a visit and kept — as the design does. */
let variant: number | null = null;

const spoken = (greetings: Greetings) => {
  variant ??= Math.floor(Math.random() * greetings[LATE_NIGHT].length);
  const set = greetings[bucketFor(new Date().getHours())];
  return set[variant] ?? set[0];
};

/** Nothing pushes a new greeting; it is read once, on the way out of hydration. */
const noUpdates = () => () => {
  /* empty */
};

interface GreetingProps {
  locale: Locale;
  className?: string;
}

/**
 * The hero kicker, greeting the visitor by their own clock.
 *
 * Both halves of the design's pick — the hour, and which of that hour's three
 * lines — are things a prerendered page cannot know, so the markup ships the
 * canonical 深夜 line and the browser reads the real one. `useSyncExternalStore`
 * rather than an effect: the clock is exactly the outside-React source it takes
 * a server snapshot for, and it swaps the line without a second render pass.
 */
export const Greeting: FC<GreetingProps> = ({ locale, className }) => {
  const { greetings } = HOME_COPY[locale];
  const line = useSyncExternalStore(
    noUpdates,
    () => spoken(greetings),
    () => greetings[LATE_NIGHT][0],
  );

  return <p className={className}>{line}</p>;
};
