import type { Phase } from './usePhaseController';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Vec2 {
  x: number;
  y: number;
}

interface PhaseMultipliers {
  glowIntensity: number;
  disruptionRadius: number;
  pullStrength: number;
  repelForce: number;
}

export interface MouseInfluence extends PhaseMultipliers {
  position: Vec2;
  velocity: Vec2;
  normalizedPosition: Vec2;
}

const PHASE_MULTIPLIERS: Record<Phase, PhaseMultipliers> = {
  boot: {
    glowIntensity: 0.3,
    disruptionRadius: 0,
    pullStrength: 0,
    repelForce: 0,
  },
  corruption: {
    glowIntensity: 0.5,
    disruptionRadius: 120,
    pullStrength: 0,
    repelForce: 0,
  },
  aftermath: {
    glowIntensity: 0.4,
    disruptionRadius: 0,
    pullStrength: 0,
    repelForce: 150,
  },
};

interface MouseState {
  position: Vec2;
  velocity: Vec2;
  normalizedPosition: Vec2;
}

interface UseMouseInfluenceOptions {
  phase: Phase;
  enabled?: boolean;
}

export const useMouseInfluence = (options: UseMouseInfluenceOptions): MouseInfluence => {
  const { phase, enabled = true } = options;

  const [mouseState, setMouseState] = useState<MouseState>({
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    normalizedPosition: { x: 0.5, y: 0.5 },
  });

  const lastPositionRef = useRef<Vec2>({ x: 0, y: 0 });
  const lastTimeRef = useRef<number>(0);
  const velocityRef = useRef<Vec2>({ x: 0, y: 0 });

  // Derive multipliers from phase (no effect needed)
  const multipliers = useMemo(() => PHASE_MULTIPLIERS[phase], [phase]);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!enabled) return;

      const now = performance.now();
      const dt = lastTimeRef.current ? (now - lastTimeRef.current) / 1000 : 0.016;

      const x = event.clientX;
      const y = event.clientY;

      // Calculate velocity
      const vx = dt > 0 ? (x - lastPositionRef.current.x) / dt : 0;
      const vy = dt > 0 ? (y - lastPositionRef.current.y) / dt : 0;

      // Smooth velocity (low-pass filter)
      const smoothFactor = 0.3;
      const smoothVx = velocityRef.current.x * (1 - smoothFactor) + vx * smoothFactor;
      const smoothVy = velocityRef.current.y * (1 - smoothFactor) + vy * smoothFactor;

      lastPositionRef.current = { x, y };
      lastTimeRef.current = now;
      velocityRef.current = { x: smoothVx, y: smoothVy };

      setMouseState({
        position: { x, y },
        velocity: { x: smoothVx, y: smoothVy },
        normalizedPosition: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
      });
    },
    [enabled],
  );

  useEffect(() => {
    if (!enabled) return;

    globalThis.addEventListener('mousemove', handleMouseMove);
    return () => {
      globalThis.removeEventListener('mousemove', handleMouseMove);
    };
  }, [enabled, handleMouseMove]);

  // Combine mouse state with phase multipliers
  return useMemo(
    () => ({
      ...mouseState,
      ...multipliers,
    }),
    [mouseState, multipliers],
  );
};

// Utility functions for physics calculations
export const distance = (a: Vec2, b: Vec2): number => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
};

export const normalize = (v: Vec2): Vec2 => {
  const mag = Math.hypot(v.x, v.y);
  if (mag === 0) return { x: 0, y: 0 };
  return { x: v.x / mag, y: v.y / mag };
};

export const subtract = (a: Vec2, b: Vec2): Vec2 => ({
  x: a.x - b.x,
  y: a.y - b.y,
});

export const add = (a: Vec2, b: Vec2): Vec2 => ({
  x: a.x + b.x,
  y: a.y + b.y,
});

export const scale = (v: Vec2, s: number): Vec2 => ({
  x: v.x * s,
  y: v.y * s,
});
