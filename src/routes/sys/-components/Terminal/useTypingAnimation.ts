import { useTypedText } from '#hooks/useTypedText';

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

/**
 * Hook for human-like typing animation with variable delays.
 * Respects prefers-reduced-motion by completing instantly.
 *
 * Thin wrapper over {@link useTypedText} that fixes the terminal's boot
 * behaviour: a 500ms initial delay, a 530ms cursor blink, and a random
 * per-character delay range.
 */
export const useTypingAnimation = (targetText: string, options: UseTypingAnimationOptions = {}): UseTypingAnimationResult => {
  const { minDelay = 50, maxDelay = 150, onComplete, enabled = true } = options;

  const { displayedText, cursorVisible, isTyping, isComplete } = useTypedText({
    text: targetText,
    enabled,
    delay: [minDelay, maxDelay],
    initialDelay: 500,
    cursorBlinkMs: 530,
    ...(onComplete !== undefined && { onComplete }),
  });

  return { displayedText, cursorVisible, isTyping, isComplete };
};
