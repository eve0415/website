import type { Locale } from '#i18n/locale';
import type { FC } from 'react';

import { HOME_COPY } from '#i18n/copy';

import { CatArt } from '../site/cat-art';
import { CloudLayer } from '../site/cloud-layer';
import { ButtonLink, localeParams } from '../site/links';
import { puffs } from '../site/puffs';
import { CAT_GLOW, CLOUD_BACK, CLOUD_FRONT, CLOUD_MID, GLOW_A, GLOW_B, GLOW_W, glow } from '../site/sky-scene';
import { ShootingStar } from '../ui/ambient/shooting-star';
import { skyCss } from '../ui/ambient/sky-background/palette';
import { StarField } from '../ui/ambient/star-field';

import './hero.css';

const SKY = skyCss(0);

const HERO_STAR_SEED = 4_150_415;

/* Each layer of the cloud sea fades out at a different depth so the sea reads
   as thick rather than as three flat sheets. */
const MASK_HERO = '[mask-image:linear-gradient(180deg,#000_0%,#000_42%,rgba(0,0,0,.6)_64%,rgba(0,0,0,.2)_82%,transparent_96%)]';
const MASK_BACK = '[mask-image:linear-gradient(180deg,#000_44%,rgba(0,0,0,.55)_64%,rgba(0,0,0,.22)_80%,transparent_97%)]';
const MASK_FRONT = '[mask-image:linear-gradient(180deg,#000_48%,rgba(0,0,0,.6)_68%,rgba(0,0,0,.25)_83%,transparent_98%)]';

const VIGNETTE = 'bg-[linear-gradient(180deg,rgba(5,2,28,.3)_0%,rgba(5,2,28,0)_24%,rgba(5,2,28,0)_58%,rgba(5,2,28,.30)_82%,rgba(5,2,28,0)_100%)]';

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
];

/** The three puffs that break over the cat's feet, in front of it. */
const CAT_CLOUDS = [
  { key: 'a', left: '-18%', right: '48%', bottom: '-4%', height: '28%', blur: 9 },
  { key: 'b', left: '-6%', right: '-10%', bottom: '-9%', height: '32%', blur: 10 },
  { key: 'c', left: '46%', right: '-24%', bottom: '-3%', height: '25%', blur: 9 },
];

const CLOUDS_BACK = puffs(1_010_415, 9, -25, 40, 220, 380);
const CLOUDS_MID = puffs(2_020_415, 11, -45, 5, 170, 300);
const CLOUDS_FRONT = puffs(3_030_415, 12, -95, -15, 150, 270);
const CLOUDS_LOW = puffs(4_040_415, 11, -175, -55, 220, 360);

/**
 * The cat sits at the right edge on a wide screen and slides off it, larger and
 * higher, once the viewport turns portrait. The design switches on the same
 * threshold from a measured aspect ratio; here the media query is the measure.
 */
const CAT_BOX =
  'absolute right-[-9vw] bottom-[40%] z-1 w-[clamp(200px,58vw,330px)] [@media(min-aspect-ratio:1.02)]:right-[3vw] [@media(min-aspect-ratio:1.02)]:bottom-[5%] [@media(min-aspect-ratio:1.02)]:w-[clamp(260px,36vw,540px)]';

const CAT_SIZES = '(min-aspect-ratio: 1.02) clamp(260px, 36vw, 540px), clamp(200px, 58vw, 330px)';

interface HeroProps {
  locale: Locale;
}

export const Hero: FC<HeroProps> = ({ locale }) => {
  const copy = HOME_COPY[locale];

  return (
    <section className='relative mt-[-61px] grid min-h-[calc(100svh-61px)] content-end'>
      <div aria-hidden='true' className={`absolute inset-x-0 top-0 bottom-[-240px] ${MASK_HERO}`} style={{ background: SKY.heroBg }}>
        <div className='absolute inset-x-0 top-0 bottom-[240px]'>
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

      <div aria-hidden='true' className={`pointer-events-none absolute inset-x-0 top-0 bottom-[-240px] ${MASK_BACK}`}>
        <div className='absolute inset-x-0 top-0 bottom-[240px] animate-[driftX_44s_ease-in-out_infinite_alternate]'>
          <CloudLayer puffs={CLOUDS_BACK} background={CLOUD_BACK} blur={13} />
        </div>
        <div className='absolute inset-x-0 top-0 bottom-[240px] animate-[evDriftXY_32s_ease-in-out_infinite_alternate-reverse]'>
          <CloudLayer puffs={CLOUDS_MID} background={CLOUD_MID} blur={9} />
          <CloudLayer puffs={CLOUDS_LOW} background={CLOUD_BACK} blur={15} />
        </div>
      </div>

      <div className={`pointer-events-none ${CAT_BOX}`}>
        <span
          aria-hidden='true'
          className='absolute right-[4%] bottom-[4%] left-[6%] h-[36%] animate-[glowPulse_5s_ease-in-out_infinite_alternate] rounded-[50%] blur-[22px]'
          style={{ background: CAT_GLOW }}
        />
        <CatArt alt={copy.altCat} sizes={CAT_SIZES} className='animate-[evCatFloat_7.5s_ease-in-out_infinite_alternate]' />
        {CAT_CLOUDS.map(puff => (
          <span
            key={puff.key}
            aria-hidden='true'
            className='absolute rounded-[50%]'
            style={{ left: puff.left, right: puff.right, bottom: puff.bottom, height: puff.height, background: CLOUD_FRONT, filter: `blur(${puff.blur}px)` }}
          />
        ))}
      </div>

      <div aria-hidden='true' className={`pointer-events-none absolute inset-x-0 top-0 bottom-[-240px] z-1 ${MASK_FRONT}`}>
        <div className='absolute inset-x-0 top-0 bottom-[240px] animate-[driftX_26s_ease-in-out_infinite_alternate]'>
          <CloudLayer puffs={CLOUDS_FRONT} background={CLOUD_FRONT} blur={7} />
        </div>
      </div>

      <div aria-hidden='true' className={`absolute inset-0 ${VIGNETTE}`} />

      <div aria-hidden='true' className='pointer-events-none absolute inset-0' style={{ opacity: SKY.starAlpha }}>
        <StarField count={10} topMax={58} seed={HERO_STAR_SEED} />
        <ShootingStar direction='right' tail={130} duration={17} delay={9} className='top-[7%] left-[6%]' />
      </div>
      <ShootingStar tail={160} duration={12} delay={4} className='pointer-events-none top-[9%] right-[5%]' style={{ opacity: SKY.starAlpha }} />

      <div className='relative z-2 grid max-w-[680px] justify-items-start gap-[16px] px-[clamp(22px,6vw,72px)] pb-[clamp(56px,11vh,110px)]'>
        <p className='animate-[fadeUp_0.7s_ease_0.2s_backwards] text-[14px] tracking-[0.22em] text-(--ink-ice) [text-shadow:0_1px_10px_rgba(3,1,20,.6)]'>
          {copy.greeting}
        </p>
        <h1 className='animate-[fadeUp_0.7s_ease_0.35s_backwards] text-(length:--text-hero) leading-[1.05] font-bold tracking-[0.01em] text-(--ink-title) [text-box:trim-both_cap_alphabetic] [text-shadow:0_2px_28px_rgba(3,1,20,.6)]'>
          eve0415
        </h1>
        <p className='animate-[fadeUp_0.7s_ease_0.5s_backwards] text-[clamp(15.5px,2vw,17.5px)] leading-[1.85] text-(--ink-body) [text-shadow:0_1px_14px_rgba(3,1,20,.6)]'>
          {copy.heroSub1}
          <br />
          {copy.heroSub2}
        </p>
        <div className='mt-[6px] flex animate-[fadeUp_0.7s_ease_0.65s_backwards] flex-wrap gap-[14px]'>
          <ButtonLink to='/{-$locale}/projects' params={localeParams(locale)}>
            {copy.ctaProjects}
          </ButtonLink>
          <ButtonLink variant='glass' to='/{-$locale}/links' params={localeParams(locale)}>
            {copy.ctaHire}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
};
