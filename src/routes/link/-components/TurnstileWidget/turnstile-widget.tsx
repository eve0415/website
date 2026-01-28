import type { FC } from 'react';

import { Turnstile } from '@marsidev/react-turnstile';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError: () => void;
  onExpire: () => void;
}

const TURNSTILE_SITE_KEY = '0x4AAAAAAAGrVMvtLk_3OpCX';

const TurnstileWidget: FC<TurnstileWidgetProps> = ({ onVerify, onError, onExpire }) => (
  <Turnstile
    siteKey={TURNSTILE_SITE_KEY}
    onSuccess={onVerify}
    onError={onError}
    onExpire={onExpire}
    options={{
      theme: 'dark',
      appearance: 'interaction-only',
    }}
  />
);

export default TurnstileWidget;
