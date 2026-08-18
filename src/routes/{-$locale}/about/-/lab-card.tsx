import type { Locale } from '#i18n/locale';
import type { FC } from 'react';

import { useSyncExternalStore } from 'react';

import { Card } from '#components/card';
import { LAB_COPY } from '#i18n/copy';
import { cn } from '#lib/cn';
import { tw } from '#lib/tw';

import './lab-card.css';
import { LAB_PROBES, readSupport, readSupportOnServer, subscribeToSupport } from './lab-probes';

const BADGE = tw(
  'inline-flex min-w-[76px] items-center justify-center justify-self-end rounded-[999px] border px-[10px] py-[3px] text-[0.71875rem] tracking-[0.1em]',
);

const BADGE_SUPPORTED = tw('border-[rgba(0,221,168,.45)] text-(--hue-mint)');

/** Also the "not probed yet" treatment: neutral, so it reads as no claim either way. */
const BADGE_MUTED = tw('border-[rgba(160,150,255,.26)] text-[#8d85c8]');

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
        <h2 className='text-[1.125rem] font-bold text-(--ink-title)'>{copy.title}</h2>
        <p className='text-(length:--text-nav) leading-[1.8] text-(--ink-muted)'>{copy.intro}</p>
      </div>

      <details className='ev-labdt'>
        <summary className='flex min-h-(--hit-target) items-center gap-[10px] text-(length:--text-nav) font-bold text-(--ink-ice)'>
          <span aria-hidden='true' className='ev-labarr inline-block text-(--accent-cyan)'>
            →
          </span>
          {copy.toggle(supported?.size, LAB_PROBES.length)}
        </summary>

        <div className='grid gap-[11px] pt-[8px]'>
          {LAB_PROBES.map(entry => {
            const isSupported = supported === undefined ? undefined : supported.has(entry.key);

            return (
              <div
                key={entry.key}
                className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-[12px] gap-y-[6px] border-t border-t-[rgba(160,150,255,.16)] pt-[11px]'
              >
                <span className='text-(length:--text-nav) font-bold wrap-anywhere text-(--ink-body)'>{entry.name}</span>
                <span className={cn(BADGE, isSupported === true ? BADGE_SUPPORTED : BADGE_MUTED)}>
                  {isSupported === undefined ? copy.stateUnknown : isSupported ? copy.stateSupported : copy.stateUnsupported}
                </span>
                <span className='col-span-full text-(length:--text-small) leading-[1.75] text-(--ink-muted)'>{copy.notes[entry.key]}</span>
              </div>
            );
          })}
        </div>
      </details>
    </Card>
  );
};
