import type { ContactFormResult } from '../../-utils/contact-form';
import type { ContactFormData, ValidationErrors } from '../../-utils/validation';
import type { FC, FormEvent } from 'react';

import { useState } from 'react';

import { submitContactForm } from '../../-utils/contact-form';
import { hasErrors, validateContactForm } from '../../-utils/validation';
import TurnstileWidget from '../TurnstileWidget/turnstile-widget';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

const ContactForm: FC = () => {
  const [formState, setFormState] = useState<FormState>('idle');
  const [formData, setFormData] = useState<ContactFormData>({ name: '', email: '', message: '' });
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Client-side validation on blur
  const handleBlur = (field: keyof ContactFormData) => {
    const errors = validateContactForm(formData);
    setFieldErrors(prev => ({
      ...prev,
      [field]: errors[field],
    }));
  };

  // Clear field error on focus
  const handleFocus = (field: keyof ContactFormData) => {
    setFieldErrors(prev => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
    setGlobalError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    // Client-side validation
    const errors = validateContactForm(formData);
    if (hasErrors(errors)) {
      setFieldErrors(errors);
      return;
    }

    // Check Turnstile token
    if (!turnstileToken) {
      setGlobalError('セキュリティ認証を完了してください');
      return;
    }

    setFormState('submitting');

    try {
      const result: ContactFormResult = await submitContactForm({
        data: { formData, turnstileToken },
      });

      if (result.success) {
        setFormState('success');
        setFormData({ name: '', email: '', message: '' });
        setFieldErrors({});
        setTurnstileToken(null);

        // Auto-dismiss after 5 seconds
        setTimeout(() => setFormState('idle'), 5000);
      } else {
        handleError(result);
      }
    } catch {
      setGlobalError('予期せぬエラーが発生しました。後ほどお試しください。');
      setFormState('error');
    }
  };

  const handleError = (result: Exclude<ContactFormResult, { success: true }>) => {
    setFormState('error');

    switch (result.error) {
      case 'validation':
        setFieldErrors(result.errors);
        break;
      case 'turnstile':
      case 'rate_limit':
      case 'email_failed':
        setGlobalError(result.message);
        break;
    }
  };

  const isDisabled = formState === 'submitting' || formState === 'success';
  const showAlternativeContact = globalError?.includes('Discord') || globalError?.includes('制限');

  return (
    <form data-testid='contact-form' onSubmit={handleSubmit} className='space-y-6'>
      {/* Name field */}
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

      {/* Email field */}
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

      {/* Message field */}
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

      {/* Turnstile widget */}
      <div data-testid='turnstile-container'>
        <TurnstileWidget
          onVerify={setTurnstileToken}
          onError={() => setGlobalError('セキュリティ認証に失敗しました')}
          onExpire={() => setTurnstileToken(null)}
        />
      </div>

      {/* Submit button */}
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

      {/* Success message */}
      {formState === 'success' && (
        <p data-testid='success-message' className='animate-fade-in-up text-center text-neon text-sm'>
          メッセージが送信されました。ありがとうございます!
        </p>
      )}

      {/* Global error message with alternative contact */}
      {globalError && (
        <div data-testid='error-message' className='animate-fade-in-up rounded-lg border border-orange/30 bg-orange/10 p-4'>
          <p className='text-center text-orange text-sm'>{globalError}</p>
          {showAlternativeContact && (
            <p className='mt-2 text-center text-muted-foreground text-xs'>
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
