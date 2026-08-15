import type { Locale } from '#i18n/locale';
import type { FC } from 'react';

import { useSyncExternalStore } from 'react';

import { LAB_COPY } from '#i18n/copy';

import { cn } from '../-ui/cn';
import { Card } from '../-ui/surfaces/card';

import { LAB_PROBES, readSupport, readSupportOnServer, subscribeToSupport } from './lab-probes';
import './lab-card.css';

const BADGE = 'inline-flex items-center rounded-[999px] border px-[10px] py-[3px] text-[11.5px] tracking-[0.1em]';

const BADGE_SUPPORTED = 'border-[rgba(0,221,168,.45)] text-(--hue-mint)';

/** Also the "not probed yet" treatment: neutral, so it reads as no claim either way. */
const BADGE_MUTED = 'border-[rgba(160,150,255,.26)] text-[#8d85c8]';

interface LabCardProps {
  locale: Locale;
}

/**
 * The badges answer "does *your* browser have this", which only the browser can
 * say — `CSS.supports` has no server-side answer and guessing one would be
 * wrong for half of every audience. So the prerendered HTML ships the real
 * content (every experiment's name and what it does here) with the state
 * marked unknown, and the probes fill the badges in on mount.
 *
 * The badges themselves sit inside a collapsed disclosure, so they cost no
 * layout when they land. The summary is the exception: it is always visible,
 * and gains the `（16/16 対応）` count on hydration. That growth is deliberate —
 * the alternative is either dropping a count the design calls for or asserting
 * one the server cannot know.
 */
export const LabCard: FC<LabCardProps> = ({ locale }) => {
  const copy = LAB_COPY[locale];
  const supported = useSyncExternalStore(subscribeToSupport, readSupport, readSupportOnServer);

  return (
    <Card variant='dashed' className='ev-reveal grid gap-[16px]'>
      <div className='grid gap-[7px]'>
        <p className='text-(length:--text-caption) tracking-(--tracking-kicker) text-(--ink-ice)'>LAB</p>
        <h2 className='text-[18px] font-bold text-(--ink-title)'>{copy.title}</h2>
        <p className='text-[14.5px] leading-[1.8] text-(--ink-muted)'>{copy.intro}</p>
      </div>

      <details className='ev-labdt'>
        <summary className='flex min-h-[44px] items-center gap-[10px] text-[14.5px] font-bold text-(--ink-ice)'>
          <span aria-hidden='true' className='ev-labarr inline-block text-(--accent-cyan)'>
            →
          </span>
          {copy.toggle(supported?.size, LAB_PROBES.length)}
        </summary>

        <div className='grid gap-[11px] pt-[8px]'>
          {LAB_PROBES.map(entry => {
            const isSupported = supported === undefined ? undefined : supported.has(entry.key);

            return (
              <div key={entry.key} className='flex flex-wrap items-baseline gap-[12px] border-t border-t-[rgba(160,150,255,.16)] pt-[11px]'>
                <span className='text-[14.5px] font-bold text-(--ink-body)'>{entry.name}</span>
                <span className={cn(BADGE, isSupported === true ? BADGE_SUPPORTED : BADGE_MUTED)}>
                  {isSupported === undefined ? copy.stateUnknown : isSupported ? copy.stateSupported : copy.stateUnsupported}
                </span>
                <span className='flex-[1_1_260px] text-[14px] leading-[1.75] text-(--ink-muted)'>{copy.notes[entry.key]}</span>
              </div>
            );
          })}
        </div>
      </details>
    </Card>
  );
};
