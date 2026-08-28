import type { Locale } from '#i18n/locale';
import type { FieldName } from './form-state';
import type { FC } from 'react';

import { useState } from 'react';

import { CONTACT_COPY } from '#i18n/copy';
import { cn } from '#lib/cn';
import { tw } from '#lib/tw';

import { EMAIL_MAX, MESSAGE_MAX, NAME_MAX } from './validation';

const LABEL = tw('grid gap-[7px] text-[0.84375rem] text-(--ink-ice)');

/**
 * The resting border is `rgba(160,150,255,.55)` where the design has `.28`.
 * At `.28` it composites to 1.58:1 against the field, and this border is the
 * only thing marking where the control is — WCAG 1.4.11 wants 3:1. `.55` is
 * the lowest alpha of the same hue that reaches it, measuring 3.05:1 against
 * the lightest of the three sky stops. The focus treatment is the design's own,
 * untouched: it swaps to `#04feff` at 15.74:1.
 */
const FIELD = tw(
  'ev-cf-field min-h-(--hit-target) w-full rounded-xl border border-[rgba(160,150,255,0.55)] bg-[rgba(3,1,17,0.55)] px-4 py-[11px] font-[inherit] text-(length:--text-body) leading-[1.6] text-(--ink-title) transition-[border-color,box-shadow] duration-150 ease-[ease] placeholder:text-(--ink-faint) focus:border-(--accent-cyan) focus:shadow-[0_0_0_3px_rgba(4,254,255,0.14)] focus:outline-hidden aria-invalid:not-focus:border-(--hue-rose) aria-invalid:not-focus:shadow-[0_0_0_3px_rgba(247,105,151,0.16)]',
);

interface ContactFieldsProps {
  locale: Locale;
  /** Which field the last submission rejected, if any — drives the ARIA wiring. */
  invalidField: FieldName | undefined;
  /** The id of the form's single `role="alert"` line. */
  errorId: string;
  /** First focus starts the deferred Turnstile challenge, so it resolves while typing. */
  onFocusField: () => void;
}

/**
 * The draft, and the only owner of it.
 *
 * Controlled rather than uncontrolled, because React requests the form reset
 * *before* running the action rather than on success — `startHostTransition` in
 * react-dom — so uncontrolled fields would be emptied by every rejected
 * submission, including the "still checking" one the challenge produces.
 *
 * Holding that state here rather than in the form's parent is what makes "send
 * another" a clean slate: this subtree unmounts when the confirmation replaces
 * the form, so the draft goes with it and a field added later cannot be
 * forgotten in a hand-written reset. A failed submission does not unmount
 * anything, which is exactly when the values have to survive.
 */
export const ContactFields: FC<ContactFieldsProps> = ({ locale, invalidField, errorId, onFocusField }) => {
  const copy = CONTACT_COPY[locale];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const aria = (field: FieldName) => ({
    'aria-invalid': invalidField === field ? true : undefined,
    'aria-describedby': invalidField === field ? errorId : undefined,
  });

  return (
    <>
      <div className='grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5'>
        <label className={LABEL}>
          {copy.fName}
          <input
            type='text'
            name='name'
            required
            autoComplete='name'
            maxLength={NAME_MAX}
            value={name}
            placeholder={copy.phName}
            className={FIELD}
            onFocus={onFocusField}
            onChange={event => {
              setName(event.target.value);
            }}
            {...aria('name')}
          />
        </label>
        <label className={LABEL}>
          {copy.fEmail}
          <input
            type='email'
            name='email'
            required
            autoComplete='email'
            maxLength={EMAIL_MAX}
            value={email}
            placeholder={copy.phEmail}
            className={FIELD}
            onFocus={onFocusField}
            onChange={event => {
              setEmail(event.target.value);
            }}
            {...aria('email')}
          />
        </label>
      </div>

      <label className={LABEL}>
        {copy.fMessage}
        <textarea
          name='message'
          required
          rows={5}
          maxLength={MESSAGE_MAX}
          value={message}
          placeholder={copy.phMsg}
          className={cn(FIELD, 'field-sizing-content min-h-32.5 resize-y leading-[1.7]')}
          onFocus={onFocusField}
          onChange={event => {
            setMessage(event.target.value);
          }}
          {...aria('message')}
        />
      </label>
    </>
  );
};
