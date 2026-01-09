import type { FC } from 'react';

import { Turnstile } from '@marsidev/react-turnstile';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError: () => void;
  onExpire: () => void;
}

// Turnstile site key - this is public, safe to include in client code
// You need to create a Turnstile widget in Cloudflare dashboard and replace this
const TURNSTILE_SITE_KEY = 'TODO_REPLACE_WITH_SITE_KEY';

const TurnstileWidget: FC<TurnstileWidgetProps> = ({ onVerify, onError, onExpire }) => {
  return (
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
};

export default TurnstileWidget;
