import type { RefObject } from 'react';

import { useEffect, useRef } from 'react';

export interface MousePosition {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
}

/**
 * Tracks the mouse position in a ref instead of state: the only consumer is a
 * canvas rAF loop that reads the latest value each frame, so committing React
 * state on every mousemove (a render per pixel) would be pure overhead.
 */
export const useMousePosition = (): RefObject<MousePosition> => {
  const positionRef = useRef<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0.5,
    normalizedY: 0.5,
  });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = event.clientX;
      const y = event.clientY;
      positionRef.current = {
        x,
        y,
        normalizedX: x / window.innerWidth,
        normalizedY: y / window.innerHeight,
      };
    };

    globalThis.addEventListener('mousemove', handleMouseMove);
    return () => {
      globalThis.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return positionRef;
};
