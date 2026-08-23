import type { Locale } from '#i18n/locale';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import type { FC, Ref } from 'react';

import { Turnstile } from '@marsidev/react-turnstile';

import { TURNSTILE_ACTION, TURNSTILE_SITE_KEY } from './constants';

interface TurnstileWidgetProps {
  /** Needed to drive `execute()` and to reset the widget between submissions. */
  ref: Ref<TurnstileInstance | undefined>;
  /**
   * The page's locale, not the browser's. Turnstile defaults to `auto`, which
   * reads the browser — so the Japanese page was handing a visitor an English
   * challenge. Both members are ISO 639-1 codes Turnstile supports, so the
   * locale goes straight through.
   */
  locale: Locale;
  /**
   * Only the two sizes that can fill this site's slot. `flexible` has a 300px
   * floor of its own, so anything narrower than that has to ask for `compact`
   * (150px) instead — the caller decides, because only it knows the slot.
   */
  size: 'flexible' | 'compact';
  /**
   * Fires once the widget has rendered, which is the only honest "you may call
   * `execute()` now" signal — before it there is nothing to execute and the call
   * is silently dropped. Per the package's own declaration it does not fire
   * again on `reset()`, so it is a latch rather than a repeating event.
   */
  onWidgetLoad: () => void;
  /**
   * Fires when the challenge stops being silent and puts a checkbox on screen.
   * `appearance: 'interaction-only'` means that is the only moment the widget is
   * visible at all, so it is also the only moment "wait a little" is the wrong
   * thing to tell someone.
   */
  onBeforeInteractive: () => void;
  onSuccess: (token: string) => void;
  onExpire: () => void;
  onError: () => void;
}

/**
 * `execution: 'execute'` renders the widget but holds the challenge back until
 * `ref.execute()` is called, so the caller must trigger it — on first field
 * focus rather than on submit, which lets the challenge resolve while the form
 * is still being filled in.
 *
 * `size` is the caller's: `flexible` fills the container but never goes below
 * 300px, which is wider than the slot has at a 320px viewport, so the narrow case
 * asks for `compact` instead.
 */
export const TurnstileWidget: FC<TurnstileWidgetProps> = ({ ref, locale, size, onWidgetLoad, onBeforeInteractive, onSuccess, onExpire, onError }) => (
  <Turnstile
    ref={ref}
    onWidgetLoad={onWidgetLoad}
    onBeforeInteractive={onBeforeInteractive}
    siteKey={TURNSTILE_SITE_KEY}
    options={{
      action: TURNSTILE_ACTION,
      appearance: 'interaction-only',
      execution: 'execute',
      theme: 'dark',
      language: locale,
      size,
    }}
    onSuccess={onSuccess}
    onExpire={onExpire}
    onError={onError}
  />
);
