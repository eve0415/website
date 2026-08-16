import type { TurnstileInstance } from '@marsidev/react-turnstile';
import type { FC, Ref } from 'react';

import { Turnstile } from '@marsidev/react-turnstile';

import { TURNSTILE_ACTION, TURNSTILE_SITE_KEY } from '#turnstile/constants';

interface TurnstileWidgetProps {
  /** Needed to drive `execute()` and to reset the widget between submissions. */
  ref: Ref<TurnstileInstance | undefined>;
  /**
   * Fires once the widget has rendered, which is the only honest "you may call
   * `execute()` now" signal — before it there is nothing to execute and the call
   * is silently dropped. Per the package's own declaration it does not fire
   * again on `reset()`, so it is a latch rather than a repeating event.
   */
  onWidgetLoad: () => void;
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
 * `size: 'flexible'` fills the container, minimum 300px, so the slot around it
 * wants `min-width` rather than a fixed width.
 */
export const TurnstileWidget: FC<TurnstileWidgetProps> = ({ ref, onWidgetLoad, onSuccess, onExpire, onError }) => (
  <Turnstile
    ref={ref}
    onWidgetLoad={onWidgetLoad}
    siteKey={TURNSTILE_SITE_KEY}
    options={{
      action: TURNSTILE_ACTION,
      appearance: 'interaction-only',
      execution: 'execute',
      theme: 'dark',
      size: 'flexible',
    }}
    onSuccess={onSuccess}
    onExpire={onExpire}
    onError={onError}
  />
);
