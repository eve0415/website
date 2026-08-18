import type { FC, ReactNode } from 'react';

import { startTransition, useEffect, useState } from 'react';

import { cn } from '#lib/cn';

import './command-box.css';
import { tw } from '#lib/tw';

const FRAME = tw(
  'animate-[fadeUp_0.6s_ease_0.2s_backwards] overflow-hidden rounded-[12px] border border-[rgba(160,150,255,.3)] bg-[rgba(3,1,17,.88)] shadow-[0_12px_40px_rgba(2,1,14,.45)]',
);

const BAR = tw('flex gap-[12px] border-b border-b-[rgba(160,150,255,.2)] bg-[rgba(13,8,54,.72)]');

const BUTTON = tw(
  'min-h-[44px] cursor-pointer rounded-[9px] border border-[rgba(4,254,255,.45)] bg-[rgba(4,254,255,0.05)] px-[20px] py-[8px] font-mono text-[0.84375rem] transition-[background,color,border-color] duration-150 ease-[ease] hover:border-[rgba(4,254,255,.85)] hover:bg-[rgba(4,254,255,.14)] active:transform-[scale(0.97)]',
);

const DOTS = [tw('bg-[rgba(247,105,151,.8)]'), tw('bg-[rgba(255,217,236,.65)]'), tw('bg-[rgba(0,221,168,.8)]')] as const;

/**
 * Fire-and-forget: the clipboard can refuse (permission, insecure context) and
 * there is nothing to do about it — the button still confirms what was asked.
 */
const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Denied or unavailable.
  }
};

export interface CommandSegment {
  key: string;
  text: string;
  /** A text-colour utility; the design gives each part of the command its own. */
  color: string;
}

interface CommandBoxProps {
  /** The window title, for the plain single-command variant. */
  title?: string;
  /** Tabs replacing the title, for the package-manager variant. */
  tabs?: ReactNode;
  segments: readonly CommandSegment[];
  /** What lands on the clipboard — the full command, however much is typed. */
  command: string;
  copiedText: string;
  /** The button's own label, before and after the copy. */
  copyLabel: string;
  copiedLabel: string;
  caretClassName: string;
}

export const CommandBox: FC<CommandBoxProps> = ({ title, tabs, segments, command, copiedText, copyLabel, copiedLabel, caretClassName }) => {
  /**
   * A count rather than a flag, and `0` is "not copied". A second copy inside
   * the two-second window is a new number, so the timer below restarts instead
   * of inheriting the first one's remainder — and the status region is keyed on
   * it, so it is a new node each time and the confirmation is announced again.
   * A boolean stayed `true` through both, and the repeat said nothing.
   */
  const [copies, setCopies] = useState(0);
  const copied = copies > 0;

  useEffect(() => {
    if (copies === 0) return;
    const id = setTimeout(() => {
      setCopies(0);
    }, 2000);
    return () => {
      clearTimeout(id);
    };
  }, [copies]);

  const dots = (
    <span aria-hidden='true' className={cn('flex gap-[6px]', tabs === undefined ? undefined : 'self-center pb-[7px]')}>
      {DOTS.map(dot => (
        <span key={dot} className={cn('size-[10px] rounded-[50%]', dot)} />
      ))}
    </span>
  );

  return (
    <div className={FRAME}>
      {tabs === undefined ? (
        <div className={cn(BAR, 'items-center p-[11px_16px]')}>
          {dots}
          <span className='text-[0.78125rem] text-(--ink-faint)'>{title}</span>
        </div>
      ) : (
        <div className={cn(BAR, 'items-end gap-[14px] p-[8px_14px_0]')}>
          {dots}
          {tabs}
        </div>
      )}

      <div className='flex flex-wrap items-center justify-between gap-[14px] p-[14px_16px_12px]'>
        <div className='grid flex-[1_1_240px] gap-[5px]'>
          <div className='flex items-baseline font-mono text-(length:--text-ui)'>
            <span className='mr-[10px] flex-none text-(--accent-mint)'>❯</span>
            <span className='wrap-anywhere'>
              {segments.map(segment => (
                <span key={segment.key} className={cn('whitespace-pre-wrap', segment.color)}>
                  {segment.text}
                </span>
              ))}
              <span aria-hidden='true' className={cn('ml-[3px] animate-[evBlink_1.1s_linear_infinite]', caretClassName)}>
                ▊
              </span>
            </span>
          </div>
          {/* `<output>` is `role="status"` without saying so, which is what was
              missing: the confirmation was painted and never announced. */}
          <output
            key={copies}
            className={cn(
              'block h-[1.1875rem] truncate font-mono text-(length:--text-caption) leading-[1.1875rem] text-(--hue-mint)',
              copied && 'animate-[fadeIn_0.25s_ease_both]',
            )}
          >
            {copied ? copiedText : ''}
          </output>
        </div>

        <button
          type='button'
          className={cn(BUTTON, copied ? 'text-(--hue-mint)' : 'text-(--hue-cyan)')}
          onClick={() => {
            setCopies(count => count + 1);
            // A React 19 action: the transition consumes the promise, and the
            // write still runs in the click's own task, so the clipboard keeps
            // the user activation Safari insists on.
            startTransition(async () => {
              await copy(command);
            });
          }}
        >
          {/* The visible word is the button's accessible name — no `aria-label`,
              or the name would still say "copy" while the button reads
              "copied". The ghost holds the wider of the two so the swap does
              not resize the button. */}
          <span className='grid justify-items-center'>
            <span className='col-start-1 row-start-1'>{copied ? copiedLabel : copyLabel}</span>
            <span aria-hidden='true' className='invisible col-start-1 row-start-1'>
              {copiedLabel}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};
