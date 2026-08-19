import type { Locale } from '#i18n/locale';
import type { FormError, FormFailure } from './form-state';
import type { ContactInput } from './validation';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import type { FC } from 'react';

import { useActionState, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';

import { Button } from '#components/button';
import { CONTACT_COPY } from '#i18n/copy';

import './contact-form.css';
import { ContactFields } from './fields';
import { fieldOf, readField } from './form-state';
import { swapInPlace } from './scoped-view-transition';
import { sendContact } from './send-contact';
import { isNarrowSlot, notNarrowWhenPrerendered, sizeDecidedOnce } from './turnstile/size';
import { TurnstileWidget } from './turnstile/widget';
import { checkContact } from './validation';

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

  const [token, setToken] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [lockHeight, setLockHeight] = useState<number | undefined>();
  /**
   * Not a render-time media query read: every page here is prerendered, so one
   * would resolve against the build machine and then mismatch on hydration.
   * `useSyncExternalStore` is what lets the prerendered markup and the browser
   * disagree honestly — the server snapshot renders, then the real one replaces it.
   */
  const narrow = useSyncExternalStore(sizeDecidedOnce, isNarrowSlot, notNarrowWhenPrerendered);

  const errorId = useId();

  const boxRef = useRef<HTMLDivElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);
  // Both empties are in the type and neither is written as the initial value:
  // React nulls an object ref on unmount, the package's own ref type is
  // `TurnstileInstance | undefined`, and `no-useless-undefined` rewrites an
  // explicit `undefined` here into a zero-argument `useRef` that does not typecheck.
  const widgetRef = useRef<TurnstileInstance | null | undefined>(null);

  /**
   * `onWidgetLoad` fires once the widget has actually rendered, and the docs are
   * explicit that a `reset()` does not fire it again — so this stays true for
   * the rest of the page's life once it is set. Before it, `execute()` has
   * nothing to execute.
   */
  const widgetReady = useRef(false);
  /** The challenge is deferred, so it has to be asked for exactly once — once it *can* be asked for. */
  const challengeStarted = useRef(false);
  /**
   * Someone reached the form before the widget was ready. Latching
   * `challengeStarted` on that used to deadlock the form: the challenge had not
   * begun, every later focus returned early, and submitting only ever said
   * "still checking" until the page was reloaded.
   */
  const challengeWanted = useRef(false);

  const startChallenge = () => {
    if (challengeStarted.current) return;

    const widget = widgetRef.current;
    if (!widgetReady.current || widget === null || widget === undefined) {
      challengeWanted.current = true;
      return;
    }

    challengeWanted.current = false;
    challengeStarted.current = true;
    widget.execute();
  };

  /** The re-arm: whatever was asked for early happens now, on the widget's own signal. */
  const handleWidgetLoad = () => {
    widgetReady.current = true;
    if (challengeWanted.current) startChallenge();
  };

  const rearm = () => {
    setToken(null);
    challengeStarted.current = false;
    challengeWanted.current = false;
    widgetRef.current?.reset();
  };

  // `null` rather than `undefined` for "nothing wrong": `useActionState` takes
  // its initial state as a required argument, and an explicit `undefined` there
  // is exactly what `no-useless-undefined` strips back out.
  const [failure, submit, sending] = useActionState(async (previous: FormFailure | null, formData: FormData): Promise<FormFailure | null> => {
    const seq = (previous === null ? 0 : previous.seq) + 1;

    const input: ContactInput = {
      name: readField(formData, 'name'),
      email: readField(formData, 'email'),
      message: readField(formData, 'message'),
      token: token ?? '',
    };

    // The same check the server runs, so a typo costs no round trip. It is not
    // what makes the submission safe — the handler repeats all of it.
    const invalid = checkContact(input);
    if (invalid !== undefined) return { code: invalid, seq };

    // Nothing leaves without a token: the server would refuse it anyway, and
    // asking again is more useful to the visitor than a rejection.
    if (token === null) {
      startChallenge();
      return { code: 'pending', seq };
    }

    const box = boxRef.current;
    // getBoundingClientRect reports zoomed pixels but the height is written
    // back as CSS px, so it has to come back out of the ultra-wide zoom.
    if (box !== null) setLockHeight(Math.round(box.getBoundingClientRect().height / (box.currentCSSZoom || 1)));

    const result = await sendContact({ data: input });
    if (!result.ok) {
      // The token is single-use whether or not it was accepted.
      rearm();
      return { code: result.reason, seq };
    }

    rearm();
    swapInPlace(boxRef.current, () => {
      setSent(true);
    });
    return null;
  }, null);

  const sendAnother = () => {
    // The draft is not cleared here: ContactFields owns it and unmounts with
    // the form, so the new one mounts empty.
    swapInPlace(boxRef.current, () => {
      setSent(false);
      setLockHeight(undefined);
    });
  };

  /**
   * The form subtree is gone by now, so focus was sitting on `<body>` and a
   * keyboard visitor had no way back to the "send another" button but to walk
   * the page from the top. Moving it onto the confirmation is also what makes
   * the confirmation reliably read: the live region below is inserted with its
   * content already in place, which is the one case a live region need not
   * announce.
   */
  useEffect(() => {
    if (!sent) return;
    sentRef.current?.focus();
  }, [sent]);

  const invalidField = failure === null ? undefined : fieldOf(failure.code);

  return (
    <div ref={boxRef} className='ev-cf-box grid content-start' style={lockHeight === undefined ? undefined : { minHeight: lockHeight }}>
      {/* Outside the swap on purpose: a live region has to be in the document
          *before* its content changes for the change to be announced, and
          everything below this line is replaced wholesale on success. It
          carries the headline only — focus lands on the panel itself, which
          reads the rest. */}
      <output className='absolute size-px overflow-hidden [clip-path:inset(50%)]'>{sent ? copy.sentHead : ''}</output>

      {sent ? (
        <div
          ref={sentRef}
          tabIndex={-1}
          className='grid justify-items-start gap-3 p-[6px_0_2px] focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-(--accent-cyan)'
        >
          <div className='flex items-center gap-2.5'>
            <span
              aria-hidden='true'
              className='size-3.5 bg-(--hue-mint) drop-shadow-[0_0_6px_rgba(0,221,168,.9)] [clip-path:polygon(50%_0%,61%_39%,100%_50%,61%_61%,50%_100%,39%_61%,0%_50%,39%_39%)]'
            />
            <p className='text-[1.03125rem] font-bold text-(--hue-mint)'>{copy.sentHead}</p>
          </div>
          <p className='text-(length:--text-nav) leading-[1.8] text-(--ink-muted)'>{copy.sentBody}</p>
          <Button variant='glass' className='bg-(--surface-row) px-5.5 py-2.5 text-(length:--text-nav)' onClick={sendAnother}>
            {copy.sendAnother}
          </Button>
        </div>
      ) : (
        // `noValidate` because the design answers with one `role="alert"` line
        // rather than per-field bubbles, and `checkContact` is stricter than the
        // native checks anyway. `required` still belongs on the controls: it is
        // what announces them as required, and it is not what validates them.
        <form action={submit} noValidate className='grid gap-4'>
          <ContactFields locale={locale} invalidField={invalidField} errorId={errorId} onFocusField={startChallenge} />

          {/* No minimum on the slot: the widget's own floor is the thing that has
              to fit, and forcing 300px here is what pushed the card past a 320px
              viewport that only has 222px to give it. */}
          <div className='max-w-full'>
            <TurnstileWidget
              ref={widgetRef}
              size={narrow ? 'compact' : 'flexible'}
              onWidgetLoad={handleWidgetLoad}
              onSuccess={setToken}
              onExpire={rearm}
              onError={rearm}
            />
          </div>

          <div className='flex flex-wrap items-center gap-4'>
            <Button type='submit' disabled={sending} className='px-7.5 py-3 text-(length:--text-body)'>
              {sending ? copy.submitting : copy.submit}
            </Button>
            {/* Keyed on the attempt so an identical failure twice in a row is a
                new node: `role="alert"` announces on insertion, and re-rendering
                the same text into the same node is not a change to announce. */}
            <span key={failure === null ? 0 : failure.seq} id={errorId} role='alert' className='text-(length:--text-small) text-(--hue-rose)'>
              {failure === null ? '' : errorCopy[failure.code]}
            </span>
          </div>
        </form>
      )}
    </div>
  );
};
