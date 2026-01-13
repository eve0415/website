import type { ContactFormResult } from '../../-utils/contact-form';
import type { ContactFormData, ValidationErrors } from '../../-utils/validation';
import type { FC } from 'react';

import { useCallback, useEffect, useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import { hasErrors, validateContactForm } from '../../-utils/validation';

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
    <div data-testid='turnstile-mock' className='border-line bg-surface flex h-16.25 items-center gap-2 rounded-lg border p-3'>
      <span className='text-neon'>✓</span>
      <span className='text-neon text-sm'>認証完了</span>
    </div>
  );
};

interface ContactFormForStoryProps {
  mockResult?: ContactFormResult;
  mockDelay?: number;
}

// ContactForm reimplementation for stories (to avoid vi.mock issues in Storybook)
// Uses props for mock response to avoid parallel test interference
const ContactFormForStory: FC<ContactFormForStoryProps> = ({ mockResult = { success: true }, mockDelay = 0 }) => {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState<ContactFormData>({ name: '', email: '', message: '' });
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Use ref to capture props at submit time (not stale closure)
  const mockResultRef = useRef(mockResult);
  const mockDelayRef = useRef(mockDelay);
  useEffect(() => {
    mockResultRef.current = mockResult;
    mockDelayRef.current = mockDelay;
  }, [mockResult, mockDelay]);

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

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
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
      await new Promise(resolve => setTimeout(resolve, mockDelayRef.current));
      const result = mockResultRef.current;

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
    },
    [formData, turnstileToken],
  );

  const isDisabled = formState === 'submitting' || formState === 'success';
  const showAlternativeContact = globalError?.includes('Discord') || globalError?.includes('制限');

  return (
    <form data-testid='contact-form' onSubmit={handleSubmit} className='space-y-6'>
      <div className='group'>
        <label htmlFor='name' className='text-muted-foreground group-focus-within:text-neon mb-2 block text-sm transition-colors'>
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
          className={`bg-surface text-foreground duration-fast placeholder:text-subtle-foreground w-full rounded-lg border px-4 py-3 transition-all focus:ring-1 focus:outline-none ${
            fieldErrors.name ? 'border-orange focus:border-orange focus:ring-orange' : 'border-line focus:border-neon focus:ring-neon'
          }`}
          placeholder='山田太郎'
          disabled={isDisabled}
          maxLength={100}
        />
        {fieldErrors.name && (
          <p data-testid='name-error' className='text-orange mt-1 text-sm'>
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div className='group'>
        <label htmlFor='email' className='text-muted-foreground group-focus-within:text-neon mb-2 block text-sm transition-colors'>
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
          className={`bg-surface text-foreground duration-fast placeholder:text-subtle-foreground w-full rounded-lg border px-4 py-3 transition-all focus:ring-1 focus:outline-none ${
            fieldErrors.email ? 'border-orange focus:border-orange focus:ring-orange' : 'border-line focus:border-neon focus:ring-neon'
          }`}
          placeholder='you@example.com'
          disabled={isDisabled}
        />
        {fieldErrors.email && (
          <p data-testid='email-error' className='text-orange mt-1 text-sm'>
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className='group'>
        <label htmlFor='message' className='text-muted-foreground group-focus-within:text-neon mb-2 block text-sm transition-colors'>
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
          className={`bg-surface text-foreground duration-fast placeholder:text-subtle-foreground w-full resize-none rounded-lg border px-4 py-3 transition-all focus:ring-1 focus:outline-none ${
            fieldErrors.message ? 'border-orange focus:border-orange focus:ring-orange' : 'border-line focus:border-neon focus:ring-neon'
          }`}
          placeholder='ご用件をお書きください...'
          disabled={isDisabled}
          maxLength={2000}
        />
        <div className='text-subtle-foreground mt-1 flex justify-between text-xs'>
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
        className={`group duration-fast relative w-full overflow-hidden rounded-lg px-6 py-3 font-medium transition-all ${
          formState === 'success' ? 'bg-neon/20 text-neon' : 'bg-neon text-background hover:shadow-glow/20 hover:shadow-lg'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span className='relative z-10'>
          {formState === 'submitting' ? (
            <span data-testid='submitting-text' className='flex items-center justify-center gap-2'>
              <span className='border-background size-4 animate-spin rounded-full border-2 border-t-transparent' />
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
        <p data-testid='success-message' className='animate-fade-in-up text-neon text-center text-sm'>
          メッセージが送信されました。ありがとうございます!
        </p>
      )}

      {globalError && (
        <div data-testid='error-message' className='animate-fade-in-up border-orange/30 bg-orange/10 rounded-lg border p-4'>
          <p className='text-orange text-center text-sm'>{globalError}</p>
          {showAlternativeContact && (
            <p className='text-muted-foreground mt-2 text-center text-xs'>
              <a href='https://twitter.com/eveevekun' target='_blank' rel='noopener noreferrer' className='text-neon underline'>
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
    Story => (
      <div className='bg-bg-primary w-100 p-8'>
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
  args: {
    mockResult: { success: true },
  },
  play: async context => {
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
  args: {
    mockResult: { success: true },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Fill form with data including character counter test
    await userEvent.type(canvas.getByTestId('name-input'), 'テスト太郎');
    await userEvent.type(canvas.getByTestId('email-input'), 'test@example.com');
    await userEvent.type(canvas.getByTestId('message-input'), 'テストメッセージ'.repeat(50));

    // Verify character counter updates
    await expect(canvas.getByTestId('char-counter')).toHaveTextContent(/\d+\/2000/);
  },
});

export const WithValidationErrors = meta.story({
  args: {
    mockResult: { success: true },
  },
  play: async ({ canvasElement }) => {
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
  args: {
    mockResult: { success: true },
    mockDelay: 10000, // Long delay so we can observe submitting state
  },
  play: async ({ canvasElement }) => {
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
  args: {
    mockResult: { success: true },
    mockDelay: 100,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for Turnstile
    await waitFor(() => expect(canvas.getByTestId('turnstile-mock')).toBeInTheDocument(), { timeout: 500 });

    // Fill and submit
    await fillValidForm(canvas);
    await userEvent.click(canvas.getByTestId('submit-button'));

    // Wait for success
    await waitFor(() => expect(canvas.getByTestId('success-text')).toBeVisible(), { timeout: 5000 });
    await expect(canvas.getByTestId('success-message')).toBeInTheDocument();

    // Form should be cleared
    await expect(canvas.getByTestId('name-input')).toHaveValue('');
    await expect(canvas.getByTestId('email-input')).toHaveValue('');
    await expect(canvas.getByTestId('message-input')).toHaveValue('');
  },
});

export const TurnstileError = meta.story({
  args: {
    mockResult: {
      success: false,
      error: 'turnstile',
      message: '認証に失敗しました',
    },
    mockDelay: 100,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for Turnstile
    await waitFor(() => expect(canvas.getByTestId('turnstile-mock')).toBeInTheDocument(), { timeout: 500 });

    // Fill and submit
    await fillValidForm(canvas);
    await userEvent.click(canvas.getByTestId('submit-button'));

    // Wait for error
    await waitFor(() => expect(canvas.getByTestId('error-message')).toBeVisible(), { timeout: 5000 });
    await expect(canvas.getByText('認証に失敗しました')).toBeInTheDocument();

    // No alternative contact shown for turnstile errors
    void expect(canvas.queryByText('X (@eveevekun)')).toBeNull();
  },
});

export const RateLimitError = meta.story({
  args: {
    mockResult: {
      success: false,
      error: 'rate_limit',
      message: 'メッセージの送信制限に達しました（1時間に3回まで）。Discord または X でお問い合わせください。',
    },
    mockDelay: 100,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for Turnstile
    await waitFor(() => expect(canvas.getByTestId('turnstile-mock')).toBeInTheDocument(), { timeout: 500 });

    // Fill and submit
    await fillValidForm(canvas);
    await userEvent.click(canvas.getByTestId('submit-button'));

    // Wait for error with alternative contact
    await waitFor(() => expect(canvas.getByTestId('error-message')).toBeVisible(), { timeout: 5000 });
    await expect(canvas.getByText('X (@eveevekun)')).toBeInTheDocument();
    await expect(canvas.getByText('Discord (eve0415)')).toBeInTheDocument();
  },
});

export const EmailFailedError = meta.story({
  args: {
    mockResult: {
      success: false,
      error: 'email_failed',
      message: 'メールの送信に失敗しました。Discord または X でお問い合わせください。',
    },
    mockDelay: 100,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for Turnstile
    await waitFor(() => expect(canvas.getByTestId('turnstile-mock')).toBeInTheDocument(), { timeout: 500 });

    // Fill and submit
    await fillValidForm(canvas);
    await userEvent.click(canvas.getByTestId('submit-button'));

    // Wait for error with alternative contact
    await waitFor(() => expect(canvas.getByTestId('error-message')).toBeVisible(), { timeout: 5000 });
    await expect(canvas.getByText('X (@eveevekun)')).toBeInTheDocument();
  },
});
