import { useEffect, useRef, useState } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

interface UseDecryptAnimationOptions {
  duration?: number;
  delay?: number;
  enabled?: boolean;
}

export function useDecryptAnimation(finalValue: string | number, options: UseDecryptAnimationOptions = {}): string {
  const { duration = 1500, delay = 0, enabled = true } = options;
  const finalStr = String(finalValue);

  // Initialize with final value if not enabled, otherwise show encrypted
  const [displayValue, setDisplayValue] = useState<string>(() => (enabled ? '[ENCRYPTED]' : finalStr));
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    // Skip if not enabled or already animated
    if (!enabled || hasAnimatedRef.current) return;

    const timeoutId = setTimeout(() => {
      hasAnimatedRef.current = true;

      const totalLength = finalStr.length;
      const frameCount = Math.floor(duration / 30); // ~30ms per frame
      const frameRef = { current: 0 };

      const interval = setInterval(() => {
        frameRef.current += 1;
        const progress = frameRef.current / frameCount;

        // Characters "lock in" from left to right
        const lockedChars = Math.floor(progress * totalLength);

        let result = '';
        for (let i = 0; i < totalLength; i++) {
          if (i < lockedChars) {
            // This character is "decrypted"
            result += finalStr[i];
          } else {
            // Still scrambling
            result += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }

        setDisplayValue(result);

        if (frameRef.current >= frameCount) {
          clearInterval(interval);
          setDisplayValue(finalStr);
        }
      }, 30);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [finalStr, duration, delay, enabled]);

  return displayValue;
}

// Hook for animating numbers with formatting
export function useDecryptNumber(value: number, options: UseDecryptAnimationOptions = {}): string {
  const formattedValue = value.toLocaleString();
  return useDecryptAnimation(formattedValue, options);
}
