import type { ContactFormResult } from '../../-utils/contact-form';
import type { ContactFormData, ValidationErrors } from '../../-utils/validation';
import type { FC } from 'react';

import { useEffect, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports, withDisabledAnimations } from '#.storybook/viewports';

import { hasErrors, validateContactForm } from '../../-utils/validation';

// Mock response generator
let mockResponse: ContactFormResult = { success: true };
let mockDelay = 0;

const setMockResponse = (response: ContactFormResult, delay = 0) => {
  mockResponse = response;
  mockDelay = delay;
};

// Mocked TurnstileWidget that auto-verifies
const MockTurnstileWidget: FC<{
  onVerify: (token: string) => void;
  onError: () => void;
  onExpire: () => void;
}> = ({ onVerify }) => {
  useEffect(() => {
    // Auto-verify after short delay
    const timer = setTimeout(() => onVerify('mock-token'), 50);
    return () => clearTimeout(timer);
  }, [onVerify]);

  return (
    <div data-testid='turnstile-mock' className='flex h-[65px] items-center gap-2 rounded-lg border border-line bg-surface p-3'>
      <span className='text-neon'>✓</span>
      <span className='text-neon text-sm'>認証完了</span>
    </div>
  );
};

// ContactForm reimplementation for stories (to avoid vi.mock issues in Storybook)
const ContactFormForStory: FC = () => {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState<ContactFormData>({ name: '', email: '', message: '' });
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleBlur = (field: keyof ContactFormData) => {
    const errors = validateContactForm(formData);
    setFieldErrors(prev => ({ ...prev, [field]: errors[field] }));
  };

  const handleFocus = (field: keyof ContactFormData) => {
    setFieldErrors(prev => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
    setGlobalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    const errors = validateContactForm(formData);
    if (hasErrors(errors)) {
      setFieldErrors(errors);
      return;
    }

    if (!turnstileToken) {
      setGlobalError('セキュリティ認証を完了してください');
      return;
    }

    setFormState('submitting');

    // Simulate async call with mock response
    await new Promise(resolve => setTimeout(resolve, mockDelay));
    const result = mockResponse;

    if (result.success) {
      setFormState('success');
      setFormData({ name: '', email: '', message: '' });
      setFieldErrors({});
      setTurnstileToken(null);
      setTimeout(() => setFormState('idle'), 5000);
    } else {
      setFormState('error');
      if (result.error === 'validation') {
        setFieldErrors(result.errors);
      } else {
        setGlobalError(result.message);
      }
    }
  };

  const isDisabled = formState === 'submitting' || formState === 'success';
  const showAlternativeContact = globalError?.includes('Discord') || globalError?.includes('制限');

  return (
    <form data-testid='contact-form' onSubmit={handleSubmit} className='space-y-6'>
      <div className='group'>
        <label htmlFor='name' className='mb-2 block text-muted-foreground text-sm transition-colors group-focus-within:text-neon'>
          お名前
        </label>
        <input
          type='text'
          id='name'
          data-testid='name-input'
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          onBlur={() => handleBlur('name')}
          onFocus={() => handleFocus('name')}
          className={`w-full rounded-lg border bg-surface px-4 py-3 text-foreground transition-all duration-fast placeholder:text-subtle-foreground focus:outline-none focus:ring-1 ${
            fieldErrors.name ? 'border-orange focus:border-orange focus:ring-orange' : 'border-line focus:border-neon focus:ring-neon'
          }`}
          placeholder='山田太郎'
          disabled={isDisabled}
          maxLength={100}
        />
        {fieldErrors.name && (
          <p data-testid='name-error' className='mt-1 text-orange text-sm'>
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div className='group'>
        <label htmlFor='email' className='mb-2 block text-muted-foreground text-sm transition-colors group-focus-within:text-neon'>
          メールアドレス
        </label>
        <input
          type='email'
          id='email'
          data-testid='email-input'
          value={formData.email}
          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
          onBlur={() => handleBlur('email')}
          onFocus={() => handleFocus('email')}
          className={`w-full rounded-lg border bg-surface px-4 py-3 text-foreground transition-all duration-fast placeholder:text-subtle-foreground focus:outline-none focus:ring-1 ${
            fieldErrors.email ? 'border-orange focus:border-orange focus:ring-orange' : 'border-line focus:border-neon focus:ring-neon'
          }`}
          placeholder='you@example.com'
          disabled={isDisabled}
        />
        {fieldErrors.email && (
          <p data-testid='email-error' className='mt-1 text-orange text-sm'>
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className='group'>
        <label htmlFor='message' className='mb-2 block text-muted-foreground text-sm transition-colors group-focus-within:text-neon'>
          メッセージ
        </label>
        <textarea
          id='message'
          data-testid='message-input'
          rows={5}
          value={formData.message}
          onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
          onBlur={() => handleBlur('message')}
          onFocus={() => handleFocus('message')}
          className={`w-full resize-none rounded-lg border bg-surface px-4 py-3 text-foreground transition-all duration-fast placeholder:text-subtle-foreground focus:outline-none focus:ring-1 ${
            fieldErrors.message ? 'border-orange focus:border-orange focus:ring-orange' : 'border-line focus:border-neon focus:ring-neon'
          }`}
          placeholder='ご用件をお書きください...'
          disabled={isDisabled}
          maxLength={2000}
        />
        <div className='mt-1 flex justify-between text-subtle-foreground text-xs'>
          {fieldErrors.message ? (
            <p data-testid='message-error' className='text-orange'>
              {fieldErrors.message}
            </p>
          ) : (
            <span />
          )}
          <span data-testid='char-counter'>{formData.message.length}/2000</span>
        </div>
      </div>

      <div data-testid='turnstile-container'>
        <MockTurnstileWidget
          onVerify={setTurnstileToken}
          onError={() => setGlobalError('セキュリティ認証に失敗しました')}
          onExpire={() => setTurnstileToken(null)}
        />
      </div>

      <button
        type='submit'
        data-testid='submit-button'
        disabled={isDisabled}
        className={`group relative w-full overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-fast ${
          formState === 'success' ? 'bg-neon/20 text-neon' : 'bg-neon text-background hover:shadow-glow/20 hover:shadow-lg'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span className='relative z-10'>
          {formState === 'submitting' ? (
            <span data-testid='submitting-text' className='flex items-center justify-center gap-2'>
              <span className='size-4 animate-spin rounded-full border-2 border-background border-t-transparent' />
              送信中...
            </span>
          ) : formState === 'success' ? (
            <span data-testid='success-text'>送信完了!</span>
          ) : (
            <span data-testid='idle-text'>送信する</span>
          )}
        </span>
      </button>

      {formState === 'success' && (
        <p data-testid='success-message' className='animate-fade-in-up text-center text-neon text-sm'>
          メッセージが送信されました。ありがとうございます!
        </p>
      )}

      {globalError && (
        <div data-testid='error-message' className='animate-fade-in-up rounded-lg border border-orange/30 bg-orange/10 p-4'>
          <p className='text-center text-orange text-sm'>{globalError}</p>
          {showAlternativeContact && (
            <p className='mt-2 text-center text-muted-foreground text-xs'>
              <a href='https://twitter.com/eveevekun' target='_blank' rel='noopener noreferrer' className='text-neon hover:underline'>
                X (@eveevekun)
              </a>
              {' または '}
              <span className='text-neon'>Discord (eve0415)</span>
              {' でもお問い合わせいただけます'}
            </p>
          )}
        </div>
      )}
    </form>
  );
};

const meta = preview.meta({
  component: ContactFormForStory,
  title: 'Link/ContactForm',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    withDisabledAnimations,
    Story => (
      <div className='w-[400px] bg-bg-primary p-8'>
        <Story />
      </div>
    ),
  ],
});

// Helper to fill form with valid data
const fillValidForm = async (canvas: ReturnType<typeof within>) => {
  await userEvent.type(canvas.getByTestId('name-input'), 'テスト太郎');
  await userEvent.type(canvas.getByTestId('email-input'), 'test@example.com');
  await userEvent.type(canvas.getByTestId('message-input'), 'これはテストメッセージです。お問い合わせ内容をここに記載します。');
};

export const Default = meta.story({
  play: async context => {
    // Reset mock for this story
    setMockResponse({ success: true });

    await testAllViewports(context);

    const canvas = within(context.canvasElement);
    await expect(canvas.getByTestId('idle-text')).toHaveTextContent('送信する');
    await expect(canvas.getByTestId('name-input')).toHaveValue('');
    await expect(canvas.getByTestId('email-input')).toHaveValue('');
    await expect(canvas.getByTestId('message-input')).toHaveValue('');
    await expect(canvas.getByTestId('char-counter')).toHaveTextContent('0/2000');
  },
});

export const Filled = meta.story({
  play: async ({ canvasElement }) => {
    setMockResponse({ success: true });

    const canvas = within(canvasElement);

    // Fill form with data including character counter test
    await userEvent.type(canvas.getByTestId('name-input'), 'テスト太郎');
    await userEvent.type(canvas.getByTestId('email-input'), 'test@example.com');
    await userEvent.type(canvas.getByTestId('message-input'), 'テストメッセージ'.repeat(50));

    // Verify character counter updates
    await expect(canvas.getByTestId('char-counter')).toHaveTextContent(/\d+\/2000/);
    await expect(canvas.getByTestId('char-counter')).not.toHaveTextContent('0/2000');
  },
});

export const WithValidationErrors = meta.story({
  play: async ({ canvasElement }) => {
    setMockResponse({ success: true });

    const canvas = within(canvasElement);

    // Wait for Turnstile to auto-verify
    await waitFor(() => expect(canvas.getByTestId('turnstile-mock')).toBeInTheDocument(), { timeout: 500 });

    // Submit empty form
    await userEvent.click(canvas.getByTestId('submit-button'));

    // All validation errors should appear
    await expect(canvas.getByTestId('name-error')).toBeVisible();
    await expect(canvas.getByTestId('email-error')).toBeVisible();
    await expect(canvas.getByTestId('message-error')).toBeVisible();
  },
});

export const Submitting = meta.story({
  play: async ({ canvasElement }) => {
    // Set long delay so we can observe submitting state
    setMockResponse({ success: true }, 10000);

    const canvas = within(canvasElement);

    // Wait for Turnstile
    await waitFor(() => expect(canvas.getByTestId('turnstile-mock')).toBeInTheDocument(), { timeout: 500 });

    // Fill and submit
    await fillValidForm(canvas);
    await userEvent.click(canvas.getByTestId('submit-button'));

    // Should show submitting state
    await expect(canvas.getByTestId('submitting-text')).toBeVisible();
    await expect(canvas.getByTestId('name-input')).toBeDisabled();
    await expect(canvas.getByTestId('email-input')).toBeDisabled();
    await expect(canvas.getByTestId('message-input')).toBeDisabled();
    await expect(canvas.getByTestId('submit-button')).toBeDisabled();
  },
});

export const Success = meta.story({
  play: async ({ canvasElement }) => {
    setMockResponse({ success: true }, 100);

    const canvas = within(canvasElement);

    // Wait for Turnstile
    await waitFor(() => expect(canvas.getByTestId('turnstile-mock')).toBeInTheDocument(), { timeout: 500 });

    // Fill and submit
    await fillValidForm(canvas);
    await userEvent.click(canvas.getByTestId('submit-button'));

    // Wait for success
    await waitFor(() => expect(canvas.getByTestId('success-text')).toBeVisible(), { timeout: 2000 });
    await expect(canvas.getByTestId('success-message')).toBeInTheDocument();

    // Form should be cleared
    await expect(canvas.getByTestId('name-input')).toHaveValue('');
    await expect(canvas.getByTestId('email-input')).toHaveValue('');
    await expect(canvas.getByTestId('message-input')).toHaveValue('');
  },
});

export const TurnstileError = meta.story({
  play: async ({ canvasElement }) => {
    setMockResponse(
      {
        success: false,
        error: 'turnstile',
        message: '認証に失敗しました',
      },
      100,
    );

    const canvas = within(canvasElement);

    // Wait for Turnstile
    await waitFor(() => expect(canvas.getByTestId('turnstile-mock')).toBeInTheDocument(), { timeout: 500 });

    // Fill and submit
    await fillValidForm(canvas);
    await userEvent.click(canvas.getByTestId('submit-button'));

    // Wait for error
    await waitFor(() => expect(canvas.getByTestId('error-message')).toBeVisible(), { timeout: 2000 });
    await expect(canvas.getByText('認証に失敗しました')).toBeInTheDocument();

    // No alternative contact shown for turnstile errors
    void expect(canvas.queryByText('X (@eveevekun)')).toBeNull();
  },
});

export const RateLimitError = meta.story({
  play: async ({ canvasElement }) => {
    setMockResponse(
      {
        success: false,
        error: 'rate_limit',
        message: 'メッセージの送信制限に達しました（1時間に3回まで）。Discord または X でお問い合わせください。',
      },
      100,
    );

    const canvas = within(canvasElement);

    // Wait for Turnstile
    await waitFor(() => expect(canvas.getByTestId('turnstile-mock')).toBeInTheDocument(), { timeout: 500 });

    // Fill and submit
    await fillValidForm(canvas);
    await userEvent.click(canvas.getByTestId('submit-button'));

    // Wait for error with alternative contact
    await waitFor(() => expect(canvas.getByTestId('error-message')).toBeVisible(), { timeout: 2000 });
    await expect(canvas.getByText('X (@eveevekun)')).toBeInTheDocument();
    await expect(canvas.getByText('Discord (eve0415)')).toBeInTheDocument();
  },
});

export const EmailFailedError = meta.story({
  play: async ({ canvasElement }) => {
    setMockResponse(
      {
        success: false,
        error: 'email_failed',
        message: 'メールの送信に失敗しました。Discord または X でお問い合わせください。',
      },
      100,
    );

    const canvas = within(canvasElement);

    // Wait for Turnstile
    await waitFor(() => expect(canvas.getByTestId('turnstile-mock')).toBeInTheDocument(), { timeout: 500 });

    // Fill and submit
    await fillValidForm(canvas);
    await userEvent.click(canvas.getByTestId('submit-button'));

    // Wait for error with alternative contact
    await waitFor(() => expect(canvas.getByTestId('error-message')).toBeVisible(), { timeout: 2000 });
    await expect(canvas.getByText('X (@eveevekun)')).toBeInTheDocument();
  },
});
