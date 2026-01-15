import type { FC } from 'react';

import { useEffect, useRef } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

import { useMousePosition } from './useMousePosition';

const Background: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useMousePosition();
  const reducedMotion = useReducedMotion();

  // Store latest mouse position in ref for access in animation loop without triggering effect re-runs
  const mousePositionRef = useRef(mousePosition);

  // Sync ref with latest mouse position (only when mousePosition changes)
  useEffect(() => {
    mousePositionRef.current = mousePosition;
  }, [mousePosition]);

  // Store static mouse position for reduced motion mode
  // This ensures stable rendering for visual regression tests
  const staticMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Grid settings
    const gridSize = 50;
    const dotSize = 1;

    let animationId: number;

    const draw = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid dots
      ctx.fillStyle = 'rgba(64, 64, 64, 0.3)';

      // Use static position for reduced motion, live position otherwise (read from ref for latest value)
      const effectivePosition = reducedMotion ? staticMouseRef.current : mousePositionRef.current;

      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          // Calculate distance from mouse for reactive effect
          const dx = x - effectivePosition.x;
          const dy = y - effectivePosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 200;

          // Increase size/opacity near mouse
          let size = dotSize;
          let alpha = 0.3;

          if (!reducedMotion && distance < maxDistance) {
            const factor = 1 - distance / maxDistance;
            size = dotSize + factor * 2;
            alpha = 0.3 + factor * 0.4;
          }

          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;

      // Only continue animation loop if motion is not reduced
      if (!reducedMotion) {
        animationId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className='pointer-events-none fixed inset-0 -z-10' aria-hidden='true' />;
};

export default Background;
