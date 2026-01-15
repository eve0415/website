import type { ContactFormResult } from '../../-utils/contact-form';
import type { FC } from 'react';

import { useForm } from '@tanstack/react-form';
import { useState } from 'react';

import { submitContactForm } from '../../-utils/contact-form';
import TurnstileWidget from '../TurnstileWidget/turnstile-widget';

type SubmissionState = 'idle' | 'success' | 'error';

// Field validators
const validateName = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return 'お名前を入力してください';
  if (trimmed.length > 100) return 'お名前は100文字以内で入力してください';
  return undefined;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validateEmail = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return 'メールアドレスを入力してください';
  if (!EMAIL_REGEX.test(trimmed)) return '有効なメールアドレスを入力してください';
  return undefined;
};

const validateMessage = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return 'メッセージを入力してください';
  if (trimmed.length > 2000) return 'メッセージは2000文字以内で入力してください';
  return undefined;
};

const ContactForm: FC = () => {
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      message: '',
      turnstileToken: '' as string,
    },
    onSubmit: async ({ value }) => {
      setGlobalError(null);

      // Check Turnstile token
      if (!value.turnstileToken) {
        setGlobalError('セキュリティ認証を完了してください');
        return;
      }

      try {
        const result: ContactFormResult = await submitContactForm({
          data: {
            formData: {
              name: value.name,
              email: value.email,
              message: value.message,
            },
            turnstileToken: value.turnstileToken,
          },
        });

        if (result.success) {
          setSubmissionState('success');
          form.reset();

          // Auto-dismiss after 5 seconds
          setTimeout(() => setSubmissionState('idle'), 5000);
        } else {
          handleError(result);
        }
      } catch {
        setGlobalError('予期せぬエラーが発生しました。後ほどお試しください。');
        setSubmissionState('error');
      }
    },
  });

  const handleError = (result: Exclude<ContactFormResult, { success: true }>) => {
    setSubmissionState('error');

    switch (result.error) {
      case 'validation':
        // Set field errors from server response
        if (result.errors.name) {
          form.setFieldMeta('name', prev => ({ ...prev, errors: [result.errors.name!] }));
        }
        if (result.errors.email) {
          form.setFieldMeta('email', prev => ({ ...prev, errors: [result.errors.email!] }));
        }
        if (result.errors.message) {
          form.setFieldMeta('message', prev => ({ ...prev, errors: [result.errors.message!] }));
        }
        break;
      case 'turnstile':
      case 'rate_limit':
      case 'email_failed':
        setGlobalError(result.message);
        break;
    }
  };

  const isDisabled = form.state.isSubmitting || submissionState === 'success';
  const showAlternativeContact = globalError?.includes('Discord') || globalError?.includes('制限');

  return (
    <form
      data-testid='contact-form'
      onSubmit={e => {
        e.preventDefault();
        void form.handleSubmit();
      }}
      className='space-y-6'
    >
      {/* Name field */}
      <form.Field name='name' validators={{ onBlur: ({ value }) => validateName(value) }}>
        {field => (
          <div className='group'>
            <label htmlFor='name' className='text-muted-foreground group-focus-within:text-neon mb-2 block text-sm transition-colors'>
              お名前
            </label>
            <input
              type='text'
              id='name'
              data-testid='name-input'
              value={field.state.value}
              onChange={e => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              onFocus={() => field.setMeta(prev => ({ ...prev, errors: [] }))}
              className={`bg-surface text-foreground duration-fast placeholder:text-subtle-foreground w-full rounded-lg border px-4 py-3 transition-all focus:ring-1 focus:outline-none ${
                field.state.meta.errors.length > 0 ? 'border-orange focus:border-orange focus:ring-orange' : 'border-line focus:border-neon focus:ring-neon'
              }`}
              placeholder='山田太郎'
              disabled={isDisabled}
              maxLength={100}
            />
            {field.state.meta.errors.length > 0 && (
              <p data-testid='name-error' className='text-orange mt-1 text-sm'>
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {/* Email field */}
      <form.Field name='email' validators={{ onBlur: ({ value }) => validateEmail(value) }}>
        {field => (
          <div className='group'>
            <label htmlFor='email' className='text-muted-foreground group-focus-within:text-neon mb-2 block text-sm transition-colors'>
              メールアドレス
            </label>
            <input
              type='email'
              id='email'
              data-testid='email-input'
              value={field.state.value}
              onChange={e => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              onFocus={() => field.setMeta(prev => ({ ...prev, errors: [] }))}
              className={`bg-surface text-foreground duration-fast placeholder:text-subtle-foreground w-full rounded-lg border px-4 py-3 transition-all focus:ring-1 focus:outline-none ${
                field.state.meta.errors.length > 0 ? 'border-orange focus:border-orange focus:ring-orange' : 'border-line focus:border-neon focus:ring-neon'
              }`}
              placeholder='you@example.com'
              disabled={isDisabled}
            />
            {field.state.meta.errors.length > 0 && (
              <p data-testid='email-error' className='text-orange mt-1 text-sm'>
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {/* Message field */}
      <form.Field name='message' validators={{ onBlur: ({ value }) => validateMessage(value) }}>
        {field => (
          <div className='group'>
            <label htmlFor='message' className='text-muted-foreground group-focus-within:text-neon mb-2 block text-sm transition-colors'>
              メッセージ
            </label>
            <textarea
              id='message'
              data-testid='message-input'
              rows={5}
              value={field.state.value}
              onChange={e => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              onFocus={() => field.setMeta(prev => ({ ...prev, errors: [] }))}
              className={`bg-surface text-foreground duration-fast placeholder:text-subtle-foreground w-full resize-none rounded-lg border px-4 py-3 transition-all focus:ring-1 focus:outline-none ${
                field.state.meta.errors.length > 0 ? 'border-orange focus:border-orange focus:ring-orange' : 'border-line focus:border-neon focus:ring-neon'
              }`}
              placeholder='ご用件をお書きください...'
              disabled={isDisabled}
              maxLength={2000}
            />
            <div className='text-subtle-foreground mt-1 flex justify-between text-xs'>
              {field.state.meta.errors.length > 0 ? (
                <p data-testid='message-error' className='text-orange'>
                  {field.state.meta.errors[0]}
                </p>
              ) : (
                <span />
              )}
              <span data-testid='char-counter'>{field.state.value.length}/2000</span>
            </div>
          </div>
        )}
      </form.Field>

      {/* Turnstile widget - integrated as form field */}
      <form.Field name='turnstileToken'>
        {field => (
          <div data-testid='turnstile-container'>
            <TurnstileWidget
              onVerify={token => field.handleChange(token)}
              onError={() => setGlobalError('セキュリティ認証に失敗しました')}
              onExpire={() => field.handleChange('')}
            />
          </div>
        )}
      </form.Field>

      {/* Submit button */}
      <button
        type='submit'
        data-testid='submit-button'
        disabled={isDisabled}
        className={`group duration-fast relative w-full overflow-hidden rounded-lg px-6 py-3 font-medium transition-all ${
          submissionState === 'success' ? 'bg-neon/20 text-neon' : 'bg-neon text-background hover:shadow-glow/20 hover:shadow-lg'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span className='relative z-10'>
          {form.state.isSubmitting ? (
            <span data-testid='submitting-text' className='flex items-center justify-center gap-2'>
              <span className='border-background size-4 animate-spin rounded-full border-2 border-t-transparent' />
              送信中...
            </span>
          ) : submissionState === 'success' ? (
            <span data-testid='success-text'>送信完了!</span>
          ) : (
            <span data-testid='idle-text'>送信する</span>
          )}
        </span>
      </button>

      {/* Success message */}
      {submissionState === 'success' && (
        <p data-testid='success-message' className='animate-fade-in-up text-neon text-center text-sm'>
          メッセージが送信されました。ありがとうございます!
        </p>
      )}

      {/* Global error message with alternative contact */}
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

export default ContactForm;
