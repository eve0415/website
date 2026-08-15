import type { TurnstileInstance } from '@marsidev/react-turnstile';
import type { FC, Ref } from 'react';

import { Turnstile } from '@marsidev/react-turnstile';

import { TURNSTILE_ACTION, TURNSTILE_SITE_KEY } from '#turnstile/constants';

interface TurnstileWidgetProps {
  /** Needed to drive `execute()` and to reset the widget between submissions. */
  ref: Ref<TurnstileInstance | undefined>;
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
export const TurnstileWidget: FC<TurnstileWidgetProps> = ({ ref, onSuccess, onExpire, onError }) => (
  <Turnstile
    ref={ref}
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
