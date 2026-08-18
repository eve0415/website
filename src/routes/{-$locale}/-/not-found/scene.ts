import { tw } from '#lib/tw';

import { puffs } from '../site/puffs';
import { skyCss } from '../ui/ambient/sky-background/palette';

export const SKY = skyCss(0);

export const NOT_FOUND_STAR_SEED = 4_040_404;

export const CLOUDS_BACK = puffs(5_050_404, 10, 26, 110, 200, 340);
export const CLOUDS_MID = puffs(6_060_404, 12, -10, 70, 170, 300);
export const CLOUDS_FRONT = puffs(7_070_404, 12, -60, 22, 150, 280);

export const SPARKLE = tw('[clip-path:polygon(50%_0%,61%_39%,100%_50%,61%_61%,50%_100%,39%_61%,0%_50%,39%_39%)]');

export const DIGIT = tw(
  'text-[calc(var(--moon)*1.42)] leading-none font-bold text-(--ink-title) [text-box:trim-both_cap_alphabetic] [text-shadow:0_4px_34px_rgba(3,1,20,.6),0_0_72px_rgba(142,70,217,.5)]',
);

/* Geometry only. The two bands fade in at different depths, so each supplies
   its own mask rather than overriding one on the shared constant. */
export const CLOUD_BAND = tw('absolute inset-x-[-80px] top-0 bottom-[-20px]');

export const MASK_BAND_BACK = tw('[mask:linear-gradient(180deg,transparent_0%,rgba(0,0,0,.5)_30%,#000_55%)_50%_50%/100%_100%_no-repeat]');
export const MASK_BAND_FRONT = tw('[mask:linear-gradient(180deg,transparent_0%,rgba(0,0,0,.5)_26%,#000_50%)_50%_50%/100%_100%_no-repeat]');

export const CAT_SIZES = 'clamp(96px, min(15vw, 20svh), 180px)';

/** The three puffs breaking over the cat's feet. */
export const CAT_CLOUDS = [
  { key: 'a', left: '-20%', right: '46%', bottom: '-5%', height: '28%', blur: 9 },
  { key: 'b', left: '-8%', right: '-12%', bottom: '-10%', height: '32%', blur: 10 },
  { key: 'c', left: '44%', right: '-26%', bottom: '-4%', height: '25%', blur: 9 },
];
