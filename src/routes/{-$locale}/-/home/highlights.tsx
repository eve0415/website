import type { Locale } from '#i18n/locale';
import type { FC } from 'react';

import { HOME_COPY } from '#i18n/copy';

import { CometNavLink, ProjectCardLink, localeParams } from '../routed-links';
import { GLOW_MID_A, GLOW_MID_B, GLOW_MID_C, glow } from '../sky/sky-scene';

import { SectionHeading } from './section-heading';
import './highlights.css';

/** Zero-height band of light where the cloud sea meets the page below it. */
const BRIDGE_GLOWS = [
  { key: 'a', left: '1%', top: '-70px', width: '46vw', height: '150px', color: GLOW_MID_A, fade: 72, blur: 34 },
  { key: 'b', left: '34%', top: '-30px', width: '46vw', height: '130px', color: GLOW_MID_B, fade: 70, blur: 38 },
  { key: 'c', right: '0%', top: '-60px', width: '42vw', height: '150px', color: GLOW_MID_C, fade: 74, blur: 30 },
  { key: 'd', left: '12%', top: '30px', width: '60vw', height: '160px', color: GLOW_MID_B, fade: 72, blur: 44 },
  { key: 'e', right: '6%', top: '60px', width: '40vw', height: '120px', color: GLOW_MID_C, fade: 74, blur: 40 },
];

interface HighlightsProps {
  locale: Locale;
}

export const Highlights: FC<HighlightsProps> = ({ locale }) => {
  const copy = HOME_COPY[locale];

  return (
    <>
      <div aria-hidden='true' className='pointer-events-none relative z-2 h-0'>
        {BRIDGE_GLOWS.map(spot => (
          <span
            key={spot.key}
            className='absolute rounded-[50%]'
            style={{
              left: spot.left,
              right: spot.right,
              top: spot.top,
              width: spot.width,
              height: spot.height,
              background: glow(spot.color, spot.fade),
              filter: `blur(${spot.blur}px)`,
            }}
          />
        ))}
      </div>

      <section className='ev-hl relative mx-auto grid max-w-(--page-max) gap-6.5 px-6 pt-18 pb-22'>
        <SectionHeading>{copy.homeHighlights}</SectionHeading>
        <div className='grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4.5'>
          <ProjectCardLink
            to='/{-$locale}/projects/ifpatcher'
            params={localeParams(locale)}
            name='IFPatcher'
            hue='cyan'
            description={copy.hlIfDesc}
            stat={copy.hlIfStat}
          />
          <ProjectCardLink
            to='/{-$locale}/projects/cella'
            params={localeParams(locale)}
            name='cella'
            hue='mint'
            description={copy.hlCellaDesc}
            stat={copy.alphaNow}
          />
        </div>
        <CometNavLink to='/{-$locale}/projects' params={localeParams(locale)} className='justify-self-start'>
          {copy.seeAll}
        </CometNavLink>
      </section>
    </>
  );
};
