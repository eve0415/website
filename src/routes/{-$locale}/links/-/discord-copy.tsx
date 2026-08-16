import type { FC } from 'react';

import { startTransition, useEffect, useRef, useState } from 'react';

import { cn } from '../../-/cn';
import { SweepButton } from '../../-/ui/actions/sweep-button';
import { Toast } from '../../-/ui/content/toast';

import './discord-copy.css';

const BUTTON = 'ev-cp-discord border-[rgba(4,254,255,0.55)] px-[18px] py-[8px] text-[14px] font-normal text-(--hue-cyan)';

/** The two labels ride the same grid cell and slide past each other. */
const LABEL = 'col-start-1 row-start-1 [transition:opacity_0.3s_ease,transform_0.45s_var(--ease-comet)]';

/**
 * Fire-and-forget, as the terminal panels do it: the clipboard can refuse
 * (permission, insecure context) and there is nothing to do about it.
 */
const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Denied or unavailable.
  }
};

interface DiscordCopyProps {
  handle: string;
  copyLabel: string;
  copiedLabel: string;
  /** The confirmation that appears anchored above the button. */
  toastLabel: string;
}

export const DiscordCopy: FC<DiscordCopyProps> = ({ handle, copyLabel, copiedLabel, toastLabel }) => {
  /**
   * A count rather than a flag, and `0` is "not copied". A second copy inside
   * the two-second window is a new number, so the timer restarts instead of
   * inheriting the first one's remainder — and the live region is keyed on it,
   * so it is a new node each time and the confirmation is announced again. A
   * boolean stayed `true` through both, and the repeat said nothing.
   */
  const [copies, setCopies] = useState(0);
  const copied = copies > 0;
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (copies === 0) return;
    const id = setTimeout(() => {
      setCopies(0);
    }, 2000);
    return () => {
      clearTimeout(id);
    };
  }, [copies]);

  useEffect(() => {
    const node = toastRef.current;
    if (node === null) return;

    // Every declared build target has the Popover API, but nothing stops an
    // older engine from loading the page — and there, `matches(':popover-open')`
    // throws on the unknown selector and takes the whole Links page down with
    // it. Detected rather than assumed; without it the toast simply stays put.
    if (!('showPopover' in node)) return;

    // `showPopover` throws if the popover is already open, and `hidePopover`
    // if it is already closed, so both are asked first.
    const open = node.matches(':popover-open');
    if (copied && !open) node.showPopover();
    if (!copied && open) node.hidePopover();
  }, [copied]);

  return (
    <>
      <SweepButton
        arrow=''
        // Both visible labels are decorative and the live region below is
        // deliberately empty until there is something to announce, so the name
        // is stated outright. It stays the same before and after the copy: a
        // control that renames itself under the pointer is its own problem.
        aria-label={copyLabel}
        className={BUTTON}
        onClick={() => {
          setCopies(count => count + 1);
          // A React 19 action: the transition consumes the promise while the
          // write still runs in the click's own task, keeping the user
          // activation Safari insists on.
          startTransition(async () => {
            await copy(handle);
          });
        }}
      >
        <span className='grid justify-items-center overflow-hidden'>
          <span aria-hidden='true' className={cn(LABEL, copied && 'transform-[translateY(-125%)] opacity-0')}>
            {copyLabel}
          </span>
          <span aria-hidden='true' className={cn(LABEL, !copied && 'transform-[translateY(125%)] opacity-0')}>
            {copiedLabel}
          </span>
        </span>
      </SweepButton>

      {/* The design's visually-hidden `role="status"`, as the element that
          carries that role implicitly. Empty until the copy lands, so the only
          thing it ever announces is the confirmation. A sibling of the button
          rather than a child: a live region inside the control it reports on is
          content of that control, and its text is then in the running for the
          button's own name. */}
      <output key={copies} className='absolute size-px overflow-hidden [clip-path:inset(50%)]'>
        {copied ? copiedLabel : ''}
      </output>

      {/* A popover, so the toast sits in the top layer. Anchor positioning
          resolves inside the containing block, and every block around this
          button is the height of the button — the anchored position would be
          clamped to nothing anywhere else. */}
      <Toast ref={toastRef} popover='manual' className='ev-cp-toast pointer-events-none animate-[fadeIn_0.25s_ease_both] whitespace-nowrap'>
        {toastLabel}
      </Toast>
    </>
  );
};
