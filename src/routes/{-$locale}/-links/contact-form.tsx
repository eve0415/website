import type { Locale } from '#i18n/locale';
import type { ContactFailure, ContactInput } from './validation';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import type { FC } from 'react';

import { useActionState, useRef, useState } from 'react';

import { CONTACT_COPY } from '#i18n/copy';
import { TurnstileWidget } from '#turnstile/turnstile-widget';

import { Button } from '../-ui/actions/button';
import { cn } from '../-ui/cn';

import './contact-form.css';
import { swapInPlace } from './scoped-view-transition';
import { sendContact } from './send-contact';
import { MESSAGE_MAX, checkContact } from './validation';

const LABEL = 'grid gap-[7px] text-[13.5px] text-(--ink-ice)';

/**
 * The resting border is `rgba(160,150,255,.55)` where the design has `.28`.
 * At `.28` it composites to 1.58:1 against the field, and this border is the
 * only thing marking where the control is — WCAG 1.4.11 wants 3:1. `.55` is
 * the lowest alpha of the same hue that reaches it, measuring 3.05:1 against
 * the lightest of the three sky stops. The focus treatment is the design's own,
 * untouched: it swaps to `#04feff` at 15.74:1.
 */
const FIELD =
  'w-full min-h-[44px] rounded-[12px] border border-[rgba(160,150,255,0.55)] bg-[rgba(3,1,17,0.55)] px-[16px] py-[11px] font-[inherit] text-[15.5px] leading-[1.6] text-(--ink-title) transition-[border-color,box-shadow] duration-150 ease-[ease] placeholder:text-(--ink-faint) focus:border-(--accent-cyan) focus:shadow-[0_0_0_3px_rgba(4,254,255,0.14)] focus:outline-none';

/** Everything the visitor can be told, including what only the server sees. */
type FormError = ContactFailure | 'pending';

const readField = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
};

interface ContactFormProps {
  locale: Locale;
}

export const ContactForm: FC<ContactFormProps> = ({ locale }) => {
  const copy = CONTACT_COPY[locale];

  const errorCopy = {
    name: copy.errName,
    email: copy.errEmail,
    message: copy.errMsg,
    'too-long': copy.errTooLong,
    challenge: copy.errChallenge,
    'rate-limited': copy.errRate,
    'send-failed': copy.errSend,
    pending: copy.errPending,
  } satisfies Record<FormError, string>;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [lockHeight, setLockHeight] = useState<number | undefined>();

  const boxRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<TurnstileInstance | null>(null);
  /** The challenge is deferred, so it has to be asked for exactly once. */
  const challengeStarted = useRef(false);

  const startChallenge = () => {
    if (challengeStarted.current) return;
    challengeStarted.current = true;
    widgetRef.current?.execute();
  };

  const rearm = () => {
    setToken(null);
    challengeStarted.current = false;
    widgetRef.current?.reset();
  };

  // `null` rather than `undefined` for "nothing wrong": `useActionState` takes
  // its initial state as a required argument, and an explicit `undefined` there
  // is exactly what `no-useless-undefined` strips back out.
  const [error, submit, sending] = useActionState(async (_previous: FormError | null, formData: FormData): Promise<FormError | null> => {
    const input: ContactInput = {
      name: readField(formData, 'name'),
      email: readField(formData, 'email'),
      message: readField(formData, 'message'),
      token: token ?? '',
    };

    // The same check the server runs, so a typo costs no round trip. It is not
    // what makes the submission safe — the handler repeats all of it.
    const failure = checkContact(input);
    if (failure !== undefined) return failure;

    // Nothing leaves without a token: the server would refuse it anyway, and
    // asking again is more useful to the visitor than a rejection.
    if (token === null) {
      startChallenge();
      return 'pending';
    }

    const box = boxRef.current;
    if (box !== null) setLockHeight(Math.round(box.getBoundingClientRect().height));

    const result = await sendContact({ data: input });
    if (!result.ok) {
      // The token is single-use whether or not it was accepted.
      rearm();
      return result.reason;
    }

    rearm();
    swapInPlace(boxRef.current, () => {
      setSent(true);
    });
    return null;
  }, null);

  const sendAnother = () => {
    swapInPlace(boxRef.current, () => {
      setSent(false);
      setLockHeight(undefined);
      setName('');
      setEmail('');
      setMessage('');
    });
  };

  return (
    <div ref={boxRef} className='ev-cf-box grid content-start' style={lockHeight === undefined ? undefined : { minHeight: lockHeight }}>
      {sent ? (
        <div className='grid justify-items-start gap-[12px] p-[6px_0_2px]'>
          <div className='flex items-center gap-[10px]'>
            <span
              aria-hidden='true'
              className='size-[14px] bg-(--hue-mint) drop-shadow-[0_0_6px_rgba(0,221,168,.9)] [clip-path:polygon(50%_0%,61%_39%,100%_50%,61%_61%,50%_100%,39%_61%,0%_50%,39%_39%)]'
            />
            <p className='text-[16.5px] font-bold text-(--hue-mint)'>{copy.sentHead}</p>
          </div>
          <p className='text-[14.5px] leading-[1.8] text-(--ink-muted)'>{copy.sentBody}</p>
          <Button variant='glass' className='bg-(--surface-row) px-[22px] py-[10px] text-[14.5px]' onClick={sendAnother}>
            {copy.sendAnother}
          </Button>
        </div>
      ) : (
        <form action={submit} className='grid gap-[16px]'>
          <div className='grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[14px]'>
            <label className={LABEL}>
              {copy.fName}
              <input
                type='text'
                name='name'
                autoComplete='name'
                maxLength={80}
                value={name}
                placeholder={copy.phName}
                className={FIELD}
                onFocus={startChallenge}
                onChange={event => {
                  setName(event.target.value);
                }}
              />
            </label>
            <label className={LABEL}>
              {copy.fEmail}
              <input
                type='email'
                name='email'
                autoComplete='email'
                maxLength={254}
                value={email}
                placeholder={copy.phEmail}
                className={FIELD}
                onFocus={startChallenge}
                onChange={event => {
                  setEmail(event.target.value);
                }}
              />
            </label>
          </div>

          <label className={LABEL}>
            {copy.fMessage}
            <textarea
              name='message'
              rows={5}
              maxLength={MESSAGE_MAX}
              value={message}
              placeholder={copy.phMsg}
              className={cn(FIELD, 'field-sizing-content min-h-[130px] resize-y leading-[1.7]')}
              onFocus={startChallenge}
              onChange={event => {
                setMessage(event.target.value);
              }}
            />
          </label>

          {/* `size: 'flexible'` fills the slot down to a 300px floor, so this is
              a minimum rather than the design's fixed 300px box. */}
          <div className='max-w-full min-w-[300px]'>
            <TurnstileWidget ref={widgetRef} onSuccess={setToken} onExpire={rearm} onError={rearm} />
          </div>

          <div className='flex flex-wrap items-center gap-[16px]'>
            <Button type='submit' disabled={sending} className='px-[30px] py-[12px] text-[15.5px]'>
              {sending ? copy.submitting : copy.submit}
            </Button>
            <span role='alert' className='text-[14px] text-(--hue-rose)'>
              {error === null ? '' : errorCopy[error]}
            </span>
          </div>
        </form>
      )}
    </div>
  );
};
