import { useEffect, useReducer, useRef } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

interface UseTypingAnimationOptions {
  /** Minimum delay between characters in ms */
  minDelay?: number;
  /** Maximum delay between characters in ms */
  maxDelay?: number;
  /** Callback when typing completes */
  onComplete?: () => void;
  /** Whether animation is enabled */
  enabled?: boolean;
}

interface UseTypingAnimationResult {
  /** Currently displayed text */
  displayedText: string;
  /** Whether cursor should be visible (for blinking) */
  cursorVisible: boolean;
  /** Whether typing is in progress */
  isTyping: boolean;
  /** Whether typing has completed */
  isComplete: boolean;
}

interface AnimationState {
  displayedText: string;
  isTyping: boolean;
  isComplete: boolean;
  blinkVisible: boolean;
}

type AnimationAction =
  | { type: 'RESET'; targetText: string }
  | { type: 'SKIP'; targetText: string }
  | { type: 'TYPE_CHAR'; text: string }
  | { type: 'COMPLETE' }
  | { type: 'BLINK' };

const animationReducer = (state: AnimationState, action: AnimationAction): AnimationState => {
  switch (action.type) {
    case 'RESET':
      return {
        displayedText: '',
        isTyping: true,
        isComplete: false,
        blinkVisible: true,
      };
    case 'SKIP':
      return {
        displayedText: action.targetText,
        isTyping: false,
        isComplete: true,
        blinkVisible: true,
      };
    case 'TYPE_CHAR':
      return {
        ...state,
        displayedText: action.text,
      };
    case 'COMPLETE':
      return {
        ...state,
        isTyping: false,
        isComplete: true,
      };
    case 'BLINK':
      return {
        ...state,
        blinkVisible: !state.blinkVisible,
      };
    default:
      return state;
  }
};

/**
 * Hook for human-like typing animation with variable delays.
 * Respects prefers-reduced-motion by completing instantly.
 */
export const useTypingAnimation = (targetText: string, options: UseTypingAnimationOptions = {}): UseTypingAnimationResult => {
  const { minDelay = 50, maxDelay = 150, onComplete, enabled = true } = options;

  const reducedMotion = useReducedMotion();
  const shouldAnimate = enabled && !reducedMotion;

  const initialState: AnimationState = {
    displayedText: shouldAnimate ? '' : targetText,
    isTyping: shouldAnimate,
    isComplete: !shouldAnimate,
    blinkVisible: true,
  };

  const [state, dispatch] = useReducer(animationReducer, initialState);

  const onCompleteRef = useRef(onComplete);
  // Track whether onComplete has been called to prevent duplicates
  // Must start as false so the effect can call onComplete when animation is skipped
  const hasCalledCompleteRef = useRef(false);

  // Keep onComplete ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Call onComplete once when animation is skipped due to reduced motion
  useEffect(() => {
    if (!shouldAnimate && !hasCalledCompleteRef.current) {
      hasCalledCompleteRef.current = true;
      onCompleteRef.current?.();
    }
  }, [shouldAnimate]);

  // Cursor blinking interval - only when not typing and not complete
  useEffect(() => {
    if (state.isTyping || state.isComplete) return;

    const intervalId = setInterval(() => {
      dispatch({ type: 'BLINK' });
    }, 530);

    return () => {
      clearInterval(intervalId);
    };
  }, [state.isTyping, state.isComplete]);

  // Main typing animation effect
  useEffect(() => {
    if (!shouldAnimate) return;

    let currentIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    // Reset animation state
    dispatch({ type: 'RESET', targetText });

    const scheduleNextChar = () => {
      if (cancelled) return;

      if (currentIndex >= targetText.length) {
        dispatch({ type: 'COMPLETE' });
        hasCalledCompleteRef.current = true;
        onCompleteRef.current?.();
        return;
      }

      // Random delay for human-like feel
      const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

      timeoutId = setTimeout(() => {
        if (cancelled) return;
        currentIndex += 1;
        dispatch({ type: 'TYPE_CHAR', text: targetText.slice(0, currentIndex) });
        scheduleNextChar();
      }, delay);
    };

    // Small initial delay before typing starts
    timeoutId = setTimeout(() => {
      scheduleNextChar();
    }, 500);

    return () => {
      cancelled = true;
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
  }, [targetText, shouldAnimate, minDelay, maxDelay]);

  // Cursor is always visible during typing, otherwise follows blink state
  const cursorVisible = state.isTyping || state.blinkVisible;

  return {
    displayedText: state.displayedText,
    cursorVisible,
    isTyping: state.isTyping,
    isComplete: state.isComplete,
  };
};
