import { useCallback, useEffect, useReducer, useRef } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

/**
 * Per-character delay configuration.
 *
 * - `speed`: fixed delay in ms between characters.
 * - `delay`: `[minMs, maxMs]` random delay per character for a human-like feel.
 *
 * When neither is provided, characters reveal as fast as the timer allows (0ms).
 */
interface UseTypedTextOptions {
  /** Text to reveal character by character. */
  text: string;
  /** Whether the animation should run. When false the full text is shown immediately. */
  enabled?: boolean;
  /** Fixed delay between characters in ms. Ignored when `delay` is provided. */
  speed?: number;
  /** Random delay range `[minMs, maxMs]` between characters. Takes precedence over `speed`. */
  delay?: readonly [number, number];
  /** Delay in ms before the first character is revealed. */
  initialDelay?: number;
  /** When set, the cursor blinks on this interval (ms) while idle (not typing, not complete). */
  cursorBlinkMs?: number;
  /** Called once when the animation completes (including when skipped). */
  onComplete?: () => void;
}

interface UseTypedTextResult {
  /** Currently revealed text. */
  displayedText: string;
  /** Whether characters are still being revealed. */
  isTyping: boolean;
  /** Whether the full text has been revealed. */
  isComplete: boolean;
  /** Whether a cursor should be shown. Solid while typing, follows blink state while idle. */
  cursorVisible: boolean;
  /** Reveal the full text immediately and fire `onComplete`. */
  skipToEnd: () => void;
}

interface AnimationState {
  displayedText: string;
  isTyping: boolean;
  isComplete: boolean;
  blinkVisible: boolean;
}

type AnimationAction = { type: 'RESET' } | { type: 'SKIP'; text: string } | { type: 'TYPE_CHAR'; text: string } | { type: 'COMPLETE' } | { type: 'BLINK' };

const animationReducer = (state: AnimationState, action: AnimationAction): AnimationState => {
  switch (action.type) {
    case 'RESET':
      return { displayedText: '', isTyping: true, isComplete: false, blinkVisible: true };
    case 'SKIP':
      return { displayedText: action.text, isTyping: false, isComplete: true, blinkVisible: true };
    case 'TYPE_CHAR':
      return { ...state, displayedText: action.text };
    case 'COMPLETE':
      return { ...state, isTyping: false, isComplete: true };
    case 'BLINK':
      return { ...state, blinkVisible: !state.blinkVisible };
    default:
      return state;
  }
};

/**
 * Unified typing animation hook.
 *
 * Reveals `text` character by character on a timer, exposing `displayedText`,
 * `isTyping`, and `isComplete`. Supports a fixed `speed` or a random `delay`
 * range per character, an `initialDelay` before the first character, an optional
 * blinking cursor (`cursorBlinkMs`), a one-shot `onComplete` callback, and an
 * imperative `skipToEnd`.
 *
 * Respects `prefers-reduced-motion`: when reduced motion is preferred (or the
 * animation is disabled) the full text is shown immediately and `onComplete`
 * still fires exactly once.
 *
 * The animation resets whenever `text` or `enabled` changes.
 */
export const useTypedText = (options: UseTypedTextOptions): UseTypedTextResult => {
  const { text, enabled = true, speed, delay, initialDelay = 0, cursorBlinkMs, onComplete } = options;

  const reducedMotion = useReducedMotion();
  const shouldAnimate = enabled && !reducedMotion;

  // Lazy initial state so the very first render already reflects the final
  // text when the animation is skipped (reduced motion / disabled).
  const [state, dispatch] = useReducer(animationReducer, shouldAnimate, animating => ({
    displayedText: animating ? '' : text,
    isTyping: animating,
    isComplete: !animating,
    blinkVisible: true,
  }));

  const onCompleteRef = useRef(onComplete);
  // Tracks whether onComplete has fired, to guarantee once-only semantics.
  // Starts false so the skip effect can fire it when the animation is skipped.
  const hasCalledCompleteRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Read the random delay range without making the typing effect depend on a
  // fresh array identity every render.
  const minDelay = delay?.[0];
  const maxDelay = delay?.[1];

  // Fire onComplete once when the animation is skipped (reduced motion / disabled).
  // The full text is already reflected by the lazy initial state above.
  useEffect(() => {
    if (!shouldAnimate && !hasCalledCompleteRef.current) {
      hasCalledCompleteRef.current = true;
      onCompleteRef.current?.();
    }
  }, [shouldAnimate]);

  // Cursor blink while idle (not typing, not complete). For the common configs
  // typing keeps the cursor solid, so this only runs when a caller deliberately
  // lands the hook in an idle state with `cursorBlinkMs` set.
  useEffect(() => {
    if (cursorBlinkMs === undefined || state.isTyping || state.isComplete) return;

    const intervalId = setInterval(() => {
      dispatch({ type: 'BLINK' });
    }, cursorBlinkMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [cursorBlinkMs, state.isTyping, state.isComplete]);

  // Main typing animation.
  useEffect(() => {
    if (!shouldAnimate) return;

    let currentIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    dispatch({ type: 'RESET' });

    const nextDelay = (): number => {
      if (minDelay !== undefined && maxDelay !== undefined) return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
      return speed ?? 0;
    };

    const scheduleNextChar = () => {
      if (cancelled) return;

      if (currentIndex >= text.length) {
        dispatch({ type: 'COMPLETE' });
        hasCalledCompleteRef.current = true;
        onCompleteRef.current?.();
        return;
      }

      timeoutId = setTimeout(() => {
        if (cancelled) return;
        currentIndex += 1;
        dispatch({ type: 'TYPE_CHAR', text: text.slice(0, currentIndex) });
        scheduleNextChar();
      }, nextDelay());
    };

    timeoutId = setTimeout(() => {
      scheduleNextChar();
    }, initialDelay);

    return () => {
      cancelled = true;
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
  }, [text, shouldAnimate, minDelay, maxDelay, speed, initialDelay]);

  const skipToEnd = useCallback(() => {
    dispatch({ type: 'SKIP', text });
    if (!hasCalledCompleteRef.current) {
      hasCalledCompleteRef.current = true;
      onCompleteRef.current?.();
    }
  }, [text]);

  // When not animating, reflect the live `text` prop so prop changes are
  // visible even while reduced motion is preferred.
  if (!shouldAnimate) {
    return { displayedText: text, isTyping: false, isComplete: true, cursorVisible: true, skipToEnd };
  }

  return {
    displayedText: state.displayedText,
    isTyping: state.isTyping,
    isComplete: state.isComplete,
    cursorVisible: state.isTyping || state.blinkVisible,
    skipToEnd,
  };
};
