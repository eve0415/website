import { useCallback, useEffect, useState } from 'react';

interface MousePosition {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
}

export const useMousePosition = (): MousePosition => {
  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0.5,
    normalizedY: 0.5,
  });

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const x = event.clientX;
    const y = event.clientY;
    const normalizedX = x / window.innerWidth;
    const normalizedY = y / window.innerHeight;

    setPosition({ x, y, normalizedX, normalizedY });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return position;
};
