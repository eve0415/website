import type { FC } from 'react';

import { useState } from 'react';
import { expect, fn, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

// Mock the Turnstile component for stories - simulates Cloudflare Turnstile widget
const MockTurnstile: FC<{
  onVerify: (token: string) => void;
  onError: () => void;
  onExpire: () => void;
}> = ({ onVerify, onError, onExpire }) => {
  const [status, setStatus] = useState<'pending' | 'verified' | 'error' | 'expired'>('pending');

  const handleVerify = () => {
    setStatus('verified');
    onVerify('test-token-abc123');
  };

  const handleError = () => {
    setStatus('error');
    onError();
  };

  const handleExpire = () => {
    setStatus('expired');
    onExpire();
  };

  return (
    <div data-testid='turnstile-widget' className='flex min-h-[65px] w-[300px] items-center justify-between rounded-lg border border-line bg-surface p-3'>
      <div className='flex items-center gap-2'>
        {status === 'pending' && (
          <>
            <div className='size-5 animate-spin rounded-full border-2 border-neon border-t-transparent' />
            <span className='text-muted-foreground text-sm'>認証中...</span>
          </>
        )}
        {status === 'verified' && (
          <>
            <span className='text-neon'>✓</span>
            <span className='text-neon text-sm'>認証完了</span>
          </>
        )}
        {status === 'error' && (
          <>
            <span className='text-orange'>✗</span>
            <span className='text-orange text-sm'>エラー</span>
          </>
        )}
        {status === 'expired' && (
          <>
            <span className='text-orange'>⏱</span>
            <span className='text-orange text-sm'>期限切れ</span>
          </>
        )}
      </div>

      {status === 'pending' && (
        <div className='flex gap-1'>
          <button type='button' data-testid='verify-btn' onClick={handleVerify} className='rounded bg-neon/20 px-2 py-1 text-neon text-xs hover:bg-neon/30'>
            Verify
          </button>
          <button type='button' data-testid='error-btn' onClick={handleError} className='rounded bg-orange/20 px-2 py-1 text-orange text-xs hover:bg-orange/30'>
            Error
          </button>
          <button
            type='button'
            data-testid='expire-btn'
            onClick={handleExpire}
            className='rounded bg-orange/20 px-2 py-1 text-orange text-xs hover:bg-orange/30'
          >
            Expire
          </button>
        </div>
      )}
    </div>
  );
};

// Story wrapper that uses the mock
const TurnstileWidgetStory: FC<{
  onVerify?: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}> = ({ onVerify = () => {}, onError = () => {}, onExpire = () => {} }) => {
  return <MockTurnstile onVerify={onVerify} onError={onError} onExpire={onExpire} />;
};

const meta = preview.meta({
  component: TurnstileWidgetStory,
  title: 'Link/TurnstileWidget',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    Story => (
      <div className='bg-bg-primary p-8'>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onVerify: { action: 'verified' },
    onError: { action: 'error' },
    onExpire: { action: 'expired' },
  },
});

export const Default = meta.story({
  args: {
    onVerify: fn(),
    onError: fn(),
    onExpire: fn(),
  },
  play: async context => {
    await testAllViewports(context);

    const canvas = within(context.canvasElement);
    await expect(canvas.getByTestId('turnstile-widget')).toBeInTheDocument();
    await expect(canvas.getByText('認証中...')).toBeInTheDocument();
  },
});

export const Verified = meta.story({
  args: {
    onVerify: fn(),
    onError: fn(),
    onExpire: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Click verify button
    canvas.getByTestId('verify-btn').click();

    // Assert callback was called
    await expect(args.onVerify).toHaveBeenCalledWith('test-token-abc123');

    // Assert UI updated
    await expect(canvas.getByText('認証完了')).toBeInTheDocument();
  },
});

export const Error = meta.story({
  args: {
    onVerify: fn(),
    onError: fn(),
    onExpire: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Click error button
    canvas.getByTestId('error-btn').click();

    // Assert callback was called
    await expect(args.onError).toHaveBeenCalled();

    // Assert UI updated
    await expect(canvas.getByText('エラー')).toBeInTheDocument();
  },
});

export const Expired = meta.story({
  args: {
    onVerify: fn(),
    onError: fn(),
    onExpire: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Click expire button
    canvas.getByTestId('expire-btn').click();

    // Assert callback was called
    await expect(args.onExpire).toHaveBeenCalled();

    // Assert UI updated
    await expect(canvas.getByText('期限切れ')).toBeInTheDocument();
  },
});
