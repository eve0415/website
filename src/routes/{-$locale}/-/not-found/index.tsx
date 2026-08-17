import { rootRouteId, useRouteContext } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { NOT_FOUND_COPY, SITE_COPY } from '#i18n/copy';

import { cn } from '../cn';
import { BrandLink } from '../site/brand-link';
import { CatArt } from '../site/cat-art';
import { CloudLayer } from '../site/cloud-layer';
import { LanguageSwitch } from '../site/language-switch';
import { ButtonLink, localeParams } from '../site/links';
import { navItems } from '../site/nav';
import { SiteHeader } from '../site/site-header';
import { CAT_GLOW, CLOUD_BACK, CLOUD_FRONT, CLOUD_MID, glow } from '../site/sky-scene';
import { Button } from '../ui/actions/button';
import { ShootingStar } from '../ui/ambient/shooting-star';
import { StarField } from '../ui/ambient/star-field';

import { Moon } from './moon';
import './not-found.css';
import {
  CAT_CLOUDS,
  CAT_SIZES,
  CLOUDS_BACK,
  CLOUDS_FRONT,
  CLOUDS_MID,
  CLOUD_BAND,
  DIGIT,
  MASK_BAND_BACK,
  MASK_BAND_FRONT,
  NOT_FOUND_STAR_SEED,
  SKY,
  SPARKLE,
} from './scene';

const prefersReducedMotion = () => globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const NotFound = () => {
  // The 404 hangs off the root route, so this is the only place the locale is
  // resolved — the `{-$locale}` route never matched.
  const locale = useRouteContext({ from: rootRouteId, select: context => context.locale });
  const copy = NOT_FOUND_COPY[locale];

  const rootRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLSpanElement>(null);
  const beamRef = useRef<HTMLSpanElement>(null);
  const sstarRef = useRef<HTMLSpanElement>(null);
  const catRef = useRef<HTMLButtonElement>(null);

  const [searching, setSearching] = useState(false);
  const [foundCount, setFoundCount] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [bubbleOn, setBubbleOn] = useState(false);
  // -1 so the first click lands on the first line, as the design has it.
  const [meowIdx, setMeowIdx] = useState(-1);

  // Pointer parallax. The whole depth stack reads `--mx`/`--my` off the root,
  // so one element's inline style drives every layer.
  useEffect(() => {
    const root = rootRef.current;
    let raf = 0;
    let cx = 0;
    let cy = 0;
    let tx = 0;
    let ty = 0;

    const loop = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      root?.style.setProperty('--mx', `${(cx * 11).toFixed(2)}px`);
      root?.style.setProperty('--my', `${(cy * 8).toFixed(2)}px`);
      if (Math.abs(tx - cx) < 0.002 && Math.abs(ty - cy) < 0.002) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const onMove = (event: PointerEvent) => {
      if (prefersReducedMotion()) return;
      tx = (event.clientX / globalThis.innerWidth - 0.5) * 2;
      ty = (event.clientY / globalThis.innerHeight - 0.5) * 2;
      if (raf === 0) raf = requestAnimationFrame(loop);
    };

    globalThis.addEventListener('pointermove', onMove);
    return () => {
      globalThis.removeEventListener('pointermove', onMove);
      if (raf !== 0) cancelAnimationFrame(raf);
    };
  }, []);

  // The HTTP code counts up to 404. Rendered at 404 so it is already correct
  // in the prerendered HTML and under reduced motion.
  useEffect(() => {
    const code = codeRef.current;
    if (code === null || prefersReducedMotion()) return;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - start - 400) / 1700));
      code.textContent = String(Math.round((1 - (1 - k) ** 3) * 404));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, []);

  // One search sweep: the beam turns, a star arcs across the sky, the cat
  // shakes, and after ~2s the cat comes back with something that is not a page.
  useEffect(() => {
    if (!searching) return;

    if (!prefersReducedMotion()) {
      beamRef.current?.animate(
        [
          { transform: 'rotate(-20deg)', opacity: 0 },
          { opacity: 1, offset: 0.1 },
          { opacity: 1, offset: 0.82 },
          { transform: 'rotate(500deg)', opacity: 0 },
        ],
        { duration: 1900, easing: 'cubic-bezier(.7,.01,.23,1)' },
      );
      sstarRef.current?.animate(
        [
          { offsetDistance: '0%', opacity: 0 },
          { opacity: 1, offset: 0.1 },
          { opacity: 1, offset: 0.78 },
          { offsetDistance: '100%', opacity: 0 },
        ],
        { duration: 1900, easing: 'cubic-bezier(.6,.05,.4,.95)' },
      );
      catRef.current?.animate(
        [{ rotate: '0deg' }, { rotate: '-8deg', offset: 0.22 }, { rotate: '7deg', offset: 0.56 }, { rotate: '-3deg', offset: 0.82 }, { rotate: '0deg' }],
        { duration: 1020, iterations: 2, easing: 'ease-in-out' },
      );
    }

    const id = setTimeout(() => {
      const last = foundCount + 1 >= copy.items.length;
      const apply = () => {
        setSearching(false);
        setFoundCount(foundCount + 1);
        setResult(foundCount);
        if (last) {
          setMeowIdx(2);
          setBubbleOn(true);
        }
      };
      // Without flushSync the state update lands after the transition has
      // already captured the old frame, and the chips pop in instead of growing.
      if ('startViewTransition' in document && !prefersReducedMotion()) {
        document.startViewTransition(() => {
          flushSync(apply);
        });
      } else {
        apply();
      }
    }, 2050);

    return () => {
      clearTimeout(id);
    };
  }, [searching, foundCount, copy.items.length]);

  useEffect(() => {
    if (!bubbleOn) return;
    const id = setTimeout(() => {
      setBubbleOn(false);
    }, 2600);
    return () => {
      clearTimeout(id);
    };
  }, [bubbleOn, meowIdx]);

  const done = foundCount >= copy.items.length;
  const item = result === null ? undefined : copy.items[result];

  return (
    <div ref={rootRef} className='ev-404 relative flex min-h-[calc(100svh/var(--z,1))] flex-col overflow-clip' style={{ background: SKY.rootBg }}>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 [translate:calc(var(--mx,0px)*-0.3)_calc(var(--my,0px)*-0.3)] overflow-hidden'
        style={{ background: SKY.nebulaBg }}
      >
        <div className='absolute inset-0 [translate:calc(var(--mx,0px)*-0.5)_calc(var(--my,0px)*-0.5)]'>
          <StarField count={62} seed={NOT_FOUND_STAR_SEED} />
        </div>
        <ShootingStar arc='steep' tail={110} duration={14} delay={3} className='top-[12%] right-[8%]' />
        <ShootingStar arc='long' tail={200} duration={26} delay={11} className='top-[46%] right-[-4%]' />
        <span ref={sstarRef} aria-hidden='true' className='ev-404-sstar absolute top-0 left-0 opacity-0'>
          <span className='flex items-center'>
            <span className='mr-[-3px] h-[2px] w-[150px] rounded-[2px] bg-[linear-gradient(90deg,transparent,rgba(0,221,168,.6),#04feff)]' />
            <span className='size-[8px] rounded-[50%] bg-(--star-white) shadow-(--glow-star)' />
          </span>
        </span>
      </div>

      <SiteHeader navLabel={SITE_COPY[locale].navAria} brandElement={<BrandLink locale={locale} />} items={navItems(locale).slice(1)} active='404'>
        <LanguageSwitch locale={locale} />
      </SiteHeader>

      <main className='pointer-events-none relative z-3 grid flex-1 place-items-center px-[clamp(20px,5vw,48px)] pt-[clamp(8px,1.6svh,28px)] pb-[clamp(88px,18svh,250px)]'>
        <div className='pointer-events-auto grid max-w-[760px] justify-items-center gap-[clamp(7px,1.4svh,18px)] text-center'>
          <title>{copy.docTitle}</title>

          <p className='animate-[fadeUp_0.6s_ease_0.15s_backwards] text-(length:--text-caption) tracking-[0.26em] text-(--ink-ice)'>
            NOT FOUND · HTTP{' '}
            <span ref={codeRef} className='inline-block min-w-[3ch] text-left font-bold text-(--accent-cyan)'>
              404
            </span>
          </p>

          {/* Decorative: the line above already announces "NOT FOUND · HTTP 404",
              so the giant numerals would only repeat it. */}
          <div
            aria-hidden='true'
            className='relative flex [translate:calc(var(--mx,0px)*0.6)_calc(var(--my,0px)*0.6)] items-center justify-center gap-[clamp(12px,3vw,30px)]'
          >
            <span
              aria-hidden='true'
              className={`absolute top-[-8%] left-[-5%] size-[15px] animate-[evKiraPop_0.6s_ease-in-out_1.15s_both,twinkle_3.4s_ease-in-out_2.2s_infinite] bg-(--star-white) drop-shadow-[0_0_6px_rgba(4,254,255,.9)] ${SPARKLE}`}
            />
            <span
              aria-hidden='true'
              className={`absolute right-[-4%] bottom-[-4%] size-[11px] animate-[evKiraPop_0.6s_ease-in-out_1.35s_both,twinkle_2.8s_ease-in-out_2s_infinite] bg-(--star-pink) drop-shadow-[0_0_5px_rgba(255,217,236,.9)] ${SPARKLE}`}
            />
            <span aria-hidden='true' className={`${DIGIT} animate-[evDigitIn_0.95s_var(--ev-spring)_0.12s_both,floaty_6s_ease-in-out_1.3s_infinite]`}>
              4
            </span>
            <Moon beamRef={beamRef} />
            <span aria-hidden='true' className={`${DIGIT} animate-[evDigitIn_0.95s_var(--ev-spring)_0.42s_both,floaty_6.6s_ease-in-out_1.6s_infinite]`}>
              4
            </span>
          </div>

          <h1 className='mt-[6px] animate-[fadeUp_0.7s_ease_0.75s_backwards] text-[clamp(1.375rem,min(4.4vw,4.6svh),2.375rem)] leading-[1.2] font-bold text-(--ink-title) [text-box:trim-both_cap_alphabetic] [text-shadow:0_2px_24px_rgba(3,1,20,.6)]'>
            {copy.title}
          </h1>

          <p className='animate-[fadeUp_0.7s_ease_0.9s_backwards] text-[clamp(0.84375rem,min(1.9vw,2.4svh),1.03125rem)] leading-[1.75] text-(--ink-muted) [text-shadow:0_1px_14px_rgba(3,1,20,.6)]'>
            {copy.lede1}
            <br />
            {copy.lede2}
          </p>

          <div className='relative mt-[8px] flex animate-[fadeUp_0.7s_ease_1.05s_backwards] flex-wrap justify-center gap-[14px]'>
            <ButtonLink to='/{-$locale}' params={localeParams(locale)}>
              {copy.btnHome}
            </ButtonLink>
            <ButtonLink variant='glass' to='/{-$locale}/projects' params={localeParams(locale)}>
              {copy.btnProjects}
            </ButtonLink>
            <Button
              variant='ghost'
              disabled={searching || done}
              className='min-w-[186px] justify-center disabled:pointer-events-none disabled:cursor-default disabled:opacity-45'
              onClick={() => {
                if (searching || done) return;
                setSearching(true);
                setResult(null);
                setBubbleOn(false);
              }}
            >
              {searching ? copy.btnSearching : done ? copy.btnDone : copy.btnSearch}
            </Button>

            <div
              aria-live='polite'
              className='pointer-events-none absolute top-[calc(100%+16px)] left-1/2 grid w-[min(92vw,640px)] -translate-x-1/2 content-start justify-items-center gap-[10px]'
            >
              {item !== undefined && !searching ? (
                <p className='ev-404-resline text-(length:--text-ui) leading-[1.7] text-(--ink-ice) [text-shadow:0_1px_12px_rgba(3,1,20,.8)] [view-transition-name:resline]'>
                  {copy.rescued(item)}
                </p>
              ) : null}
              {done && !searching ? (
                <p className='ev-404-resline text-(length:--text-nav) leading-[1.7] text-(--hue-violet) [text-shadow:0_1px_12px_rgba(3,1,20,.8)]'>
                  {copy.resultFinal}
                </p>
              ) : null}
              {foundCount > 0 ? (
                <div className='flex flex-wrap items-center justify-center gap-[8px]'>
                  <span className='rounded-[999px] border border-(--line-panel) bg-(--surface-panel) px-[12px] py-[4px] text-[0.78125rem] tracking-[0.14em] text-(--ink-muted)'>
                    {copy.foundLabel}
                  </span>
                  {copy.items.slice(0, foundCount).map((label, index) => (
                    <span
                      key={label}
                      className='ev-404-chip rounded-[999px] border border-dashed border-(--line-accent-dashed) bg-(--surface-panel) px-[12px] py-[4px] text-[0.78125rem] text-(--ink-ice)'
                      style={{ viewTransitionName: `chip${index}` }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      <div className='pointer-events-none absolute inset-x-0 bottom-0 z-2 h-[clamp(130px,26svh,310px)]'>
        <span
          aria-hidden='true'
          className='absolute inset-x-[-5%] top-[-6%] bottom-[-20%] bg-[linear-gradient(180deg,transparent,rgba(142,70,217,.22)_70%,rgba(142,70,217,.42)_100%)]'
        />
        <span
          aria-hidden='true'
          className='absolute bottom-[-30px] left-[8%] h-[150px] w-[52vw] rounded-[50%] blur-[36px]'
          style={{ background: glow('rgba(142,70,217,.34)', 72) }}
        />
        <span
          aria-hidden='true'
          className='absolute right-[4%] bottom-[-20px] h-[130px] w-[44vw] rounded-[50%] blur-[32px]'
          style={{ background: glow('rgba(138,70,200,.3)', 72) }}
        />

        <div className={cn(CLOUD_BAND, MASK_BAND_BACK, '[translate:calc(var(--mx,0px)*0.9)_calc(var(--my,0px)*0.4)]')}>
          <div className='absolute inset-0 animate-[driftX_26s_ease-in-out_infinite_alternate]'>
            <CloudLayer puffs={CLOUDS_BACK} background={CLOUD_BACK} blur={15} />
            <CloudLayer puffs={CLOUDS_MID} background={CLOUD_MID} blur={9} />
          </div>
        </div>

        <div className='absolute right-[clamp(2%,6vw,10%)] bottom-[clamp(10px,1.6vw,22px)] z-1 w-[clamp(96px,min(15vw,20svh),180px)] [translate:calc(var(--mx,0px)*1.3)_calc(var(--my,0px)*0.6)] animate-[fadeUp_0.8s_ease_1s_backwards]'>
          <span
            aria-hidden='true'
            className='absolute right-[2%] bottom-[4%] left-[4%] h-[38%] animate-[glowPulse_5s_ease-in-out_infinite_alternate] rounded-[50%] blur-[20px]'
            style={{ background: CAT_GLOW }}
          />
          {bubbleOn ? (
            <span className='ev-404-bubble absolute bottom-[calc(100%+14px)] left-1/2 z-2 -translate-x-1/2 rounded-[999px] border border-(--line-accent) bg-(--surface-toast) px-[16px] py-[11px] text-[0.84375rem] leading-none whitespace-nowrap text-[#d8f9ff] shadow-(--glow-toast)'>
              {copy.meows[meowIdx] ?? copy.meows[0]}
              <span
                aria-hidden='true'
                className='absolute bottom-[-5px] left-1/2 size-[9px] -translate-x-1/2 rotate-45 border-r border-b border-(--line-accent) bg-(--surface-toast)'
              />
            </span>
          ) : null}
          <button
            ref={catRef}
            type='button'
            aria-label={copy.catAria}
            className='pointer-events-auto relative m-0 block w-full cursor-pointer border-none bg-none p-0'
            onClick={() => {
              setMeowIdx((meowIdx + 1) % 3);
              setBubbleOn(true);
            }}
          >
            <CatArt alt={copy.altCat} sizes={CAT_SIZES} className='animate-[evCatFloat_3.4s_ease-in-out_infinite_alternate]' />
          </button>
          {CAT_CLOUDS.map(puff => (
            <span
              key={puff.key}
              aria-hidden='true'
              className='absolute rounded-[50%]'
              style={{ left: puff.left, right: puff.right, bottom: puff.bottom, height: puff.height, background: CLOUD_FRONT, filter: `blur(${puff.blur}px)` }}
            />
          ))}
        </div>

        <div className={cn(CLOUD_BAND, MASK_BAND_FRONT, 'z-2 [translate:calc(var(--mx,0px)*1.7)_calc(var(--my,0px)*0.7)]')}>
          <div className='absolute inset-0 animate-[driftX_19s_ease-in-out_infinite_alternate]'>
            <CloudLayer puffs={CLOUDS_FRONT} background={CLOUD_FRONT} blur={7} />
          </div>
        </div>
      </div>
    </div>
  );
};
