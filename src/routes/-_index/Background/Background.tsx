import type { FC } from "react";

import { useEffect, useRef } from "react";

import { useMousePosition } from "./useMousePosition";
import { useReducedMotion } from "./useReducedMotion";

const Background: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useMousePosition();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Grid settings
    const gridSize = 50;
    const dotSize = 1;

    let animationId: number;

    const draw = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid dots
      ctx.fillStyle = "rgba(64, 64, 64, 0.3)";

      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          // Calculate distance from mouse for reactive effect
          const dx = x - mousePosition.x;
          const dy = y - mousePosition.y;
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
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [mousePosition.x, mousePosition.y, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden="true"
    />
  );
};

export default Background;
