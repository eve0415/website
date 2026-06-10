import type { ContactFormResult } from '../../-utils/contact-form';
import type { FC } from 'react';

import { useForm } from '@tanstack/react-form-start';
import { useState } from 'react';

import { handleForm } from '../../-utils/contact-form';
import { contactFormOpts } from '../../-utils/form-options';
import { validateEmail, validateMessage, validateName } from '../../-utils/validation';
import TurnstileWidget from '../TurnstileWidget/turnstile-widget';

interface GlobalError {
  kind: 'turnstile' | 'rate_limit' | 'email_failed' | 'unexpected';
  message: string;
}

const FIELD_NAMES = ['name', 'email', 'message'] as const;

const ContactForm: FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [globalError, setGlobalError] = useState<GlobalError | null>(null);

  const form = useForm({
    ...contactFormOpts,
    onSubmit: async ({ value, formApi }) => {
      setGlobalError(null);

      // Check Turnstile token
      if (!value.turnstileToken) {
        setGlobalError({ kind: 'turnstile', message: 'セキュリティ認証を完了してください' });
        return;
      }

      try {
        // Build FormData for server submission
        const formData = new FormData();
        formData.append('name', value.name);
        formData.append('email', value.email);
        formData.append('message', value.message);
        formData.append('turnstileToken', value.turnstileToken);

        const result: ContactFormResult = await handleForm({ data: formData });

        if (result.success) {
          setSubmitted(true);
          formApi.reset();
        } else {
          handleError(result);
        }
      } catch (error) {
        console.error('Form submission failed:', error);
        setGlobalError({ kind: 'unexpected', message: '予期せぬエラーが発生しました。後ほどお試しください。' });
      }
    },
  });

  const handleError = (result: Exclude<ContactFormResult, { success: true }>) => {
    switch (result.error) {
      case 'validation': {
        // Set field errors from server response
        for (const fieldName of FIELD_NAMES) {
          const error = result.errors[fieldName];
          if (error) form.setFieldMeta(fieldName, prev => ({ ...prev, errorMap: { onSubmit: error } }));
        }
        // Move focus to the first invalid field so the error is announced
        const firstInvalid = FIELD_NAMES.find(fieldName => result.errors[fieldName]);
        if (firstInvalid) document.querySelector<HTMLElement>(`#${firstInvalid}`)?.focus();
        break;
      }
      case 'turnstile':
      case 'rate_limit':
      case 'email_failed':
        setGlobalError({ kind: result.error, message: result.message });
        break;
    }
  };

  // rate_limit / email_failed server messages point at Discord / X as fallback channels
  const showAlternativeContact = globalError?.kind === 'rate_limit' || globalError?.kind === 'email_failed';

  return (
    <form
      data-testid='contact-form'
      action={handleForm.url}
      method='post'
      encType='multipart/form-data'
      noValidate
      // oxlint-disable-next-line typescript/no-misused-promises -- Event handler, Promise is intentionally not awaited
      onSubmit={async e => {
        // Progressive enhancement: with JS, submit through TanStack Form
        // instead of the native action POST (which would render raw JSON)
        e.preventDefault();
        e.stopPropagation();
        if (form.state.isSubmitting) return;
        try {
          await form.handleSubmit();
        } catch (error) {
          console.error('Form submission failed:', error);
        }
      }}
      className='space-y-6'
    >
      {/* Name field */}
      <form.Field name='name' validators={{ onBlur: ({ value }) => validateName(value) }}>
        {field => {
          const hasError = field.state.meta.errors.length > 0;
          return (
            <div className='group'>
              <label htmlFor='name' className='text-muted-foreground group-focus-within:text-neon mb-2 block text-sm transition-colors'>
                お名前
                <span aria-hidden='true' className='text-orange ml-1'>
                  *
                </span>
              </label>
              <input
                type='text'
                id='name'
                name={field.name}
                data-testid='name-input'
                value={field.state.value}
                autoComplete='name'
                aria-required='true'
                aria-invalid={hasError}
                aria-describedby={hasError ? 'name-error' : undefined}
                onChange={e => {
                  field.handleChange(e.target.value);
                  if (hasError) field.setMeta(prev => ({ ...prev, errorMap: {} }));
                  setSubmitted(false);
                }}
                onBlur={field.handleBlur}
                className={`bg-surface text-foreground duration-fast placeholder:text-subtle-foreground w-full rounded-lg border px-4 py-3 transition-all focus:ring-1 focus:outline-none ${
                  hasError ? 'border-orange focus:border-orange focus:ring-orange' : 'border-line focus:border-neon focus:ring-neon'
                }`}
                placeholder='山田太郎'
                maxLength={100}
              />
              {hasError && (
                <p id='name-error' data-testid='name-error' className='text-orange mt-1 text-sm'>
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          );
        }}
      </form.Field>

      {/* Email field */}
      <form.Field name='email' validators={{ onBlur: ({ value }) => validateEmail(value) }}>
        {field => {
          const hasError = field.state.meta.errors.length > 0;
          return (
            <div className='group'>
              <label htmlFor='email' className='text-muted-foreground group-focus-within:text-neon mb-2 block text-sm transition-colors'>
                メールアドレス
                <span aria-hidden='true' className='text-orange ml-1'>
                  *
                </span>
              </label>
              <input
                type='email'
                id='email'
                name={field.name}
                data-testid='email-input'
                value={field.state.value}
                autoComplete='email'
                aria-required='true'
                aria-invalid={hasError}
                aria-describedby={hasError ? 'email-error' : undefined}
                onChange={e => {
                  field.handleChange(e.target.value);
                  if (hasError) field.setMeta(prev => ({ ...prev, errorMap: {} }));
                  setSubmitted(false);
                }}
                onBlur={field.handleBlur}
                className={`bg-surface text-foreground duration-fast placeholder:text-subtle-foreground w-full rounded-lg border px-4 py-3 transition-all focus:ring-1 focus:outline-none ${
                  hasError ? 'border-orange focus:border-orange focus:ring-orange' : 'border-line focus:border-neon focus:ring-neon'
                }`}
                placeholder='you@example.com'
              />
              {hasError && (
                <p id='email-error' data-testid='email-error' className='text-orange mt-1 text-sm'>
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          );
        }}
      </form.Field>

      {/* Message field */}
      <form.Field name='message' validators={{ onBlur: ({ value }) => validateMessage(value) }}>
        {field => {
          const hasError = field.state.meta.errors.length > 0;
          return (
            <div className='group'>
              <label htmlFor='message' className='text-muted-foreground group-focus-within:text-neon mb-2 block text-sm transition-colors'>
                メッセージ
                <span aria-hidden='true' className='text-orange ml-1'>
                  *
                </span>
              </label>
              <textarea
                id='message'
                name={field.name}
                data-testid='message-input'
                rows={5}
                value={field.state.value}
                aria-required='true'
                aria-invalid={hasError}
                aria-describedby={hasError ? 'message-error' : undefined}
                onChange={e => {
                  field.handleChange(e.target.value);
                  if (hasError) field.setMeta(prev => ({ ...prev, errorMap: {} }));
                  setSubmitted(false);
                }}
                onBlur={field.handleBlur}
                className={`bg-surface text-foreground duration-fast placeholder:text-subtle-foreground w-full resize-none rounded-lg border px-4 py-3 transition-all focus:ring-1 focus:outline-none ${
                  hasError ? 'border-orange focus:border-orange focus:ring-orange' : 'border-line focus:border-neon focus:ring-neon'
                }`}
                placeholder='ご用件をお書きください...'
                maxLength={2000}
              />
              <div className='text-subtle-foreground mt-1 flex justify-between text-xs'>
                {hasError ? (
                  <p id='message-error' data-testid='message-error' className='text-orange'>
                    {field.state.meta.errors[0]}
                  </p>
                ) : (
                  <span />
                )}
                <span data-testid='char-counter'>{field.state.value.length}/2000</span>
              </div>
            </div>
          );
        }}
      </form.Field>

      {/* Turnstile widget - integrated as form field */}
      <form.Field name='turnstileToken'>
        {field => (
          <div data-testid='turnstile-container'>
            <input type='hidden' name={field.name} value={field.state.value} />
            <TurnstileWidget
              onVerify={token => {
                field.handleChange(token);
              }}
              onError={() => {
                setGlobalError({ kind: 'turnstile', message: 'セキュリティ認証に失敗しました' });
              }}
              onExpire={() => {
                field.handleChange('');
              }}
            />
          </div>
        )}
      </form.Field>

      {/* Submit button - aria-disabled (not disabled) so focus is not dropped mid-submit */}
      <form.Subscribe selector={state => state.isSubmitting}>
        {isSubmitting => (
          <button
            type='submit'
            data-testid='submit-button'
            aria-disabled={isSubmitting}
            className={`group duration-fast relative w-full overflow-hidden rounded-lg px-6 py-3 font-medium transition-all ${
              submitted ? 'bg-neon/20 text-neon' : 'bg-neon text-background hover:shadow-glow/20 hover:shadow-lg'
            } aria-disabled:cursor-not-allowed aria-disabled:opacity-50`}
          >
            <span className='relative z-10'>
              {isSubmitting ? (
                <span data-testid='submitting-text' className='flex items-center justify-center gap-2'>
                  <span className='border-background size-4 animate-spin rounded-full border-2 border-t-transparent' />
                  送信中...
                </span>
              ) : submitted ? (
                <span data-testid='success-text'>送信完了!</span>
              ) : (
                <span data-testid='idle-text'>送信する</span>
              )}
            </span>
          </button>
        )}
      </form.Subscribe>

      {/* Success message - role=status announces the insertion to screen readers */}
      {submitted && (
        <p role='status' data-testid='success-message' className='animate-fade-in-up text-neon text-center text-sm'>
          メッセージが送信されました。ありがとうございます!
        </p>
      )}

      {/* Global error message with alternative contact - role=alert announces on insertion */}
      {globalError && (
        <div role='alert' data-testid='error-message' className='animate-fade-in-up border-orange/30 bg-orange/10 rounded-lg border p-4'>
          <p className='text-orange text-center text-sm'>{globalError.message}</p>
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
