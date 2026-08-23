import type { Locale } from '#i18n/locale';
import type { FC } from 'react';

import { HOME_COPY } from '#i18n/copy';
import { localeParams } from '#i18n/locale';
import { tw } from '#lib/tw';

import { CatArt } from '../cat-art';
import { ButtonLink } from '../routed-links';
import { CloudLayer } from '../sky/cloud-layer';
import { puffs } from '../sky/puffs';
import { ShootingStar } from '../sky/shooting-star';
import { CAT_GLOW, CLOUD_BACK, CLOUD_FRONT, CLOUD_MID, GLOW_A, GLOW_B, GLOW_W, glow } from '../sky/sky-scene';
import { StarField } from '../sky/star-field';

import './hero.css';
import { Greeting } from './greeting';

const HERO_STAR_SEED = 4_150_415;

/* The hero starts under the header and fills what is left of the first screen.
   `--header-h` rather than the design's flat 61px: SiteHeader keeps that token
   on the real bar, which is two rows under 45em and taller again at a large
   root font — a constant reopened the gap on exactly those.

   The header's height is taken off the box twice on purpose no longer: the
   negative margin already lifts the top edge behind the bar, so subtracting it
   from the height as well ended the section a header short of the fold. It is
   padding that owes the bar its room, and the difference is what happens when
   the copy outgrows the screen — a short phone wraps the greeting to two lines
   and the sub to three, and `content-end` spends the overflow upward. Against a
   height that stopped short, the cat's row went with it and left the head
   behind the bar; against padding, the overflow has the header's own room to
   grow into first. */
const SECTION = tw('relative -mt-(--header-h) grid min-h-[calc(100svh/var(--z,1))] content-end pt-(--header-h)');

/* Each layer of the cloud sea fades out at a different depth so the sea reads
   as thick rather than as three flat sheets.

   Each also clips, because the puffs inside it overhang the viewport by design
   and something has to catch them. The root was catching them, which a phone
   does not honour when it decides how wide to lay the page out — these boxes
   already reach 240px past the section, so clipping here costs the overshoot
   nothing and keeps the overhang out of the page's width. */
const MASK_HERO = tw('mask-[linear-gradient(180deg,#000_0%,#000_42%,rgba(0,0,0,.6)_64%,rgba(0,0,0,.2)_82%,transparent_96%)]');
const MASK_BACK = tw('mask-[linear-gradient(180deg,#000_44%,rgba(0,0,0,.55)_64%,rgba(0,0,0,.22)_80%,transparent_97%)]');
const MASK_FRONT = tw('mask-[linear-gradient(180deg,#000_48%,rgba(0,0,0,.6)_68%,rgba(0,0,0,.25)_83%,transparent_98%)]');

/* The alpha is the clock's, not a constant: this darkens the band the hero sub
   is read on, which is depth at night and 1.75 of lost contrast at noon. */
const VIGNETTE = tw(
  'bg-[linear-gradient(180deg,rgba(5,2,28,var(--sky-vignette))_0%,rgba(5,2,28,0)_24%,rgba(5,2,28,0)_58%,rgba(5,2,28,var(--sky-vignette))_82%,rgba(5,2,28,0)_100%)]',
);

/* The copy scrim. The vignette above darkens this band for depth at night while
   the ink darkens with the day, so the two ends of the clock want opposite
   things of the sky behind the copy. `--sky-scrim` carries the colour as well
   as the alpha, so this only has to place it.

   Only the plateau is the copy: it runs the width of the column and stops 56px
   above the buttons, and everything outside it is fade. The fade up is long on
   purpose, 200px of it: at the alpha dusk asks for, a 44px feather still reads
   as a pale card behind the text, where at this length the same wash reads as
   the sky brightening toward the horizon, which is what the gradient under it
   is already doing.

   Sideways it stops at the gutter, where it used to run half a viewport past
   each edge and let the root clip the remainder. The remainder was never drawn,
   but it counted: a phone sizes its layout viewport to fit the widest thing on
   the page, so half a viewport of invisible scrim laid the site out half again
   too wide and scaled the whole of it down to fit. Ending at the gutter draws
   the same wash — the fade lands in the margin either way, and at 6% alpha its
   edge was never the thing you could see. */
const SCRIM = tw(
  'pointer-events-none absolute -inset-x-(--page-gutter) -top-54 bottom-0 -z-1 bg-[linear-gradient(180deg,transparent_0,var(--sky-scrim)_200px,var(--sky-scrim)_calc(100%-56px),transparent_100%)] mask-[linear-gradient(90deg,transparent_0,#000_var(--page-gutter),#000_calc(100%-var(--page-gutter)),transparent_100%)]',
);

/** The lights inside the cloud sea, front to back as the design layers them. */
const HERO_GLOWS = [
  { key: 'a', left: '4%', right: '40%', bottom: '-60px', height: '200px', color: GLOW_A, fade: 72, blur: 38 },
  { key: 'b', left: '42%', right: '2%', bottom: '-70px', height: '220px', color: GLOW_B, fade: 74, blur: 34 },
  { key: 'c', left: '20%', right: '20%', bottom: '-90px', height: '200px', color: GLOW_W, fade: 70, blur: 40 },
  { key: 'd', left: '-6%', right: '55%', bottom: '-30px', height: '150px', color: GLOW_A, fade: 72, blur: 30 },
  { key: 'e', left: '58%', right: '-8%', bottom: '-40px', height: '170px', color: GLOW_B, fade: 74, blur: 32 },
  { key: 'f', left: '12%', right: '12%', bottom: '-55px', height: '190px', color: GLOW_W, fade: 74, blur: 36 },
  { key: 'g', left: '28%', right: '32%', bottom: '-45px', height: '165px', color: GLOW_W, fade: 70, blur: 28 },
  { key: 'h', left: '54%', right: '4%', bottom: '-30px', height: '145px', color: GLOW_W, fade: 72, blur: 24 },
] as const;

/** The three puffs that break over the cat's feet, in front of it. */
const CAT_CLOUDS = [
  { key: 'a', left: '-18%', right: '48%', bottom: '-4%', height: '28%', blur: 9 },
  { key: 'b', left: '-6%', right: '-10%', bottom: '-9%', height: '32%', blur: 10 },
  { key: 'c', left: '46%', right: '-24%', bottom: '-3%', height: '25%', blur: 9 },
] as const;

const CLOUDS_BACK = puffs(1_010_415, 9, -25, 40, 220, 380);
const CLOUDS_MID = puffs(2_020_415, 11, -45, 5, 170, 300);
const CLOUDS_FRONT = puffs(3_030_415, 12, -95, -15, 150, 270);
const CLOUDS_LOW = puffs(4_040_415, 11, -175, -55, 220, 360);

/**
 * The cat sits at the right edge on a wide screen and slides off it once the
 * viewport turns portrait. The design switches on the same threshold from a
 * measured aspect ratio; here the media query is the measure.
 *
 * Portrait takes it out of position and gives it a row of its own above the
 * copy. A phone's copy column is the whole screen, so nothing the cat carries
 * can sit beside the text: its black body painted across the daytime greeting
 * and the pale puffs across the night title, and no ink clears both, because
 * the pale paint that ruins the title at midnight is what carries the
 * near-black greeting at noon. Only separating them serves both clocks. The
 * bottom margin is for the drop shadow, which reaches lower than the box.
 *
 * Portrait size answers to the viewport height as well as its width, so that
 * the cat, that margin and the copy still fit one screen of a short phone.
 *
 * On a wide screen it also divides its vw sizing by the ultra-wide zoom and
 * pins itself to the shell edge, so it tracks the content instead of drifting
 * out to the corner of a very wide display.
 */
const CAT_BOX = tw(
  'relative z-1 mr-[-9vw] mb-10 w-[clamp(200px,min(58vw,26svh),330px)] justify-self-end [@media(min-aspect-ratio:1.02)]:absolute [@media(min-aspect-ratio:1.02)]:right-[max(3vw/var(--z,1),50vw/var(--z,1)_-_810px)] [@media(min-aspect-ratio:1.02)]:bottom-[5%] [@media(min-aspect-ratio:1.02)]:m-0 [@media(min-aspect-ratio:1.02)]:w-[clamp(260px,36vw/var(--z,1),600px)]',
);

const CAT_SIZES = '(min-aspect-ratio: 1.02) clamp(260px, 36vw, 600px), clamp(200px, min(58vw, 26svh), 330px)';

interface HeroProps {
  locale: Locale;
}

export const Hero: FC<HeroProps> = ({ locale }) => {
  const copy = HOME_COPY[locale];

  return (
    <section className={SECTION}>
      <div aria-hidden='true' className={`absolute inset-x-0 top-0 bottom-[-240px] overflow-hidden ${MASK_HERO}`} style={{ background: 'var(--sky-hero)' }}>
        <div className='absolute inset-x-0 top-0 bottom-60'>
          {HERO_GLOWS.map(spot => (
            <span
              key={spot.key}
              className='absolute rounded-[50%]'
              style={{
                left: spot.left,
                right: spot.right,
                bottom: spot.bottom,
                height: spot.height,
                background: glow(spot.color, spot.fade),
                filter: `blur(${spot.blur}px)`,
              }}
            />
          ))}
        </div>
      </div>

      <div aria-hidden='true' className={`pointer-events-none absolute inset-x-0 top-0 bottom-[-240px] overflow-hidden ${MASK_BACK}`}>
        <div className='absolute inset-x-0 top-0 bottom-60 animate-[driftX_44s_ease-in-out_infinite_alternate]'>
          <CloudLayer puffs={CLOUDS_BACK} background={CLOUD_BACK} blur={13} />
        </div>
        <div className='absolute inset-x-0 top-0 bottom-60 animate-[evDriftXY_32s_ease-in-out_infinite_alternate-reverse]'>
          <CloudLayer puffs={CLOUDS_MID} background={CLOUD_MID} blur={9} />
          <CloudLayer puffs={CLOUDS_LOW} background={CLOUD_BACK} blur={15} />
        </div>
      </div>

      {/* The box overhangs the gutter and the drop shadow spreads past that
          again. Both are transparent, but a phone measures them: iOS shrinks a
          page to fit its widest thing, so the overhang was scaling the whole
          site down. Clipped here it stays a drawing instead of a layout.

          Landscape takes the section's own box rather than stepping out of the
          way, because there the cat is absolute: a clip only reaches what it is
          the containing block for, so the wrapper has to be that block. Same
          box, same offsets, and the shadow is inside something. */}
      <div className='grid overflow-hidden [@media(min-aspect-ratio:1.02)]:absolute [@media(min-aspect-ratio:1.02)]:inset-0'>
        <div className={`pointer-events-none ${CAT_BOX}`}>
          <span
            aria-hidden='true'
            className='absolute right-[4%] bottom-[4%] left-[6%] h-[36%] animate-[glowPulse_5s_ease-in-out_infinite_alternate] rounded-[50%] blur-[22px]'
            style={{ background: CAT_GLOW }}
          />
          <CatArt alt={copy.altCat} sizes={CAT_SIZES} fetchPriority='high' className='animate-[evCatFloat_7.5s_ease-in-out_infinite_alternate]' />
          {CAT_CLOUDS.map(puff => (
            <span
              key={puff.key}
              aria-hidden='true'
              className='absolute rounded-[50%]'
              style={{ left: puff.left, right: puff.right, bottom: puff.bottom, height: puff.height, background: CLOUD_FRONT, filter: `blur(${puff.blur}px)` }}
            />
          ))}
        </div>
      </div>

      <div aria-hidden='true' className={`pointer-events-none absolute inset-x-0 top-0 bottom-[-240px] z-1 overflow-hidden ${MASK_FRONT}`}>
        <div className='absolute inset-x-0 top-0 bottom-60 animate-[driftX_26s_ease-in-out_infinite_alternate]'>
          <CloudLayer puffs={CLOUDS_FRONT} background={CLOUD_FRONT} blur={7} />
        </div>
      </div>

      <div aria-hidden='true' className={`absolute inset-0 ${VIGNETTE}`} />

      <div aria-hidden='true' className='pointer-events-none absolute inset-0 overflow-hidden' style={{ opacity: 'var(--sky-star-alpha)' }}>
        <StarField count={10} topMax={58} seed={HERO_STAR_SEED} />
        <ShootingStar direction='right' tail={130} duration={17} delay={9} className='top-[7%] left-[6%]' />
      </div>
      <ShootingStar tail={160} duration={12} delay={4} className='pointer-events-none top-[9%] right-[5%]' style={{ opacity: 'var(--sky-star-alpha)' }} />

      <div className='ev-on-clouds relative z-2 mx-auto w-full max-w-(--page-max-wide) px-(--page-gutter) pb-[clamp(56px,11vh,110px)]'>
        <div className='relative grid max-w-170 justify-items-start gap-4'>
          <div aria-hidden='true' className={SCRIM} />
          <Greeting
            locale={locale}
            className='animate-[fadeUp_0.7s_ease_0.2s_backwards] text-(length:--text-small) tracking-[0.22em] text-(--ink-ice) [text-shadow:0_1px_10px_var(--ink-shadow)]'
          />
          <h1 className='animate-[fadeUp_0.7s_ease_0.35s_backwards] text-(length:--text-hero) leading-[1.05] font-bold tracking-[0.01em] text-(--ink-title) [text-box:trim-both_cap_alphabetic] [text-shadow:0_2px_28px_var(--ink-shadow)]'>
            eve0415
          </h1>
          <p className='animate-[fadeUp_0.7s_ease_0.5s_backwards] text-[clamp(0.96875rem,2vw,1.09375rem)] leading-[1.85] text-(--ink-body) [text-shadow:0_1px_14px_var(--ink-shadow)]'>
            {copy.heroSub1}
            <br />
            {copy.heroSub2}
          </p>
          <div className='mt-1.5 flex animate-[fadeUp_0.7s_ease_0.65s_backwards] flex-wrap gap-3.5'>
            <ButtonLink to='/{-$locale}/projects' params={localeParams(locale)}>
              {copy.ctaProjects}
            </ButtonLink>
            <ButtonLink variant='glass' to='/{-$locale}/links' params={localeParams(locale)}>
              {copy.ctaHire}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
};
