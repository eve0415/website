// Typewriter effect hook for AI skill descriptions
// Avoids synchronous setState in effect body per React Compiler rules

import { useCallback, useEffect, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

interface UseTypewriterOptions {
  /** Text to type out */
  text: string;
  /** Delay between characters in ms (default: 10) */
  speed?: number;
  /** Whether to start typing (default: true) */
  enabled?: boolean;
}

interface UseTypewriterResult {
  /** Currently displayed text */
  displayedText: string;
  /** Whether typing is in progress */
  isTyping: boolean;
  /** Whether typing has completed */
  isComplete: boolean;
  /** Skip to end immediately */
  skipToEnd: () => void;
}

export function useTypewriter({ text, speed = 10, enabled = true }: UseTypewriterOptions): UseTypewriterResult {
  const prefersReducedMotion = useReducedMotion();
  // Initialize with a key based on text to reset on text change
  const [state, setState] = useState({ charIndex: 0, textKey: text });

  // Handle text changes by resetting charIndex
  const charIndex = state.textKey === text ? state.charIndex : 0;

  // Animation interval - all setState calls are in interval callback (external subscription)
  useEffect(() => {
    if (!enabled || prefersReducedMotion) {
      return;
    }

    let localIndex = 0;

    const intervalId = setInterval(() => {
      if (localIndex < text.length) {
        localIndex += 1;
        setState({ charIndex: localIndex, textKey: text });
      } else {
        clearInterval(intervalId);
      }
    }, speed);

    return () => {
      clearInterval(intervalId);
    };
  }, [text, speed, enabled, prefersReducedMotion]);

  const skipToEnd = useCallback(() => {
    setState({ charIndex: text.length, textKey: text });
  }, [text]);

  // Handle reduced motion - show full text immediately
  if (prefersReducedMotion && enabled) {
    return {
      displayedText: text,
      isTyping: false,
      isComplete: true,
      skipToEnd,
    };
  }

  // Handle disabled state
  if (!enabled) {
    return {
      displayedText: '',
      isTyping: false,
      isComplete: false,
      skipToEnd,
    };
  }

  const displayedText = text.slice(0, charIndex);
  const isComplete = charIndex >= text.length;

  return {
    displayedText,
    isTyping: !isComplete,
    isComplete,
    skipToEnd,
  };
}
