// Node materialize animation state machine
// Handles the "construction" animation when new AI-discovered skills appear

import { useEffect, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

export type MaterializePhase = 'hidden' | 'crosshair' | 'wireframe' | 'particles' | 'flash' | 'visible';

interface MaterializeState {
  phase: MaterializePhase;
  progress: number; // 0-1 within current phase
}

interface UseNodeMaterializeOptions {
  /** Whether this node should animate in */
  shouldAnimate: boolean;
  /** Delay before starting animation (for staggering) */
  delay?: number;
}

interface UseNodeMaterializeResult {
  /** Current animation phase */
  phase: MaterializePhase;
  /** Progress within current phase (0-1) */
  progress: number;
  /** Whether animation is complete */
  isComplete: boolean;
}

// Phase durations in ms
const PHASE_DURATIONS: Record<MaterializePhase, number> = {
  hidden: 0,
  crosshair: 400,
  wireframe: 600,
  particles: 800,
  flash: 300,
  visible: 0,
};

const PHASE_ORDER: MaterializePhase[] = ['hidden', 'crosshair', 'wireframe', 'particles', 'flash', 'visible'];

export const useNodeMaterialize = ({ shouldAnimate, delay = 0 }: UseNodeMaterializeOptions): UseNodeMaterializeResult => {
  const prefersReducedMotion = useReducedMotion();

  // Handle reduced motion or no animation - return immediately without effect
  const skipAnimation = !shouldAnimate || prefersReducedMotion;

  const [state, setState] = useState<MaterializeState>({
    phase: skipAnimation ? 'visible' : 'hidden',
    progress: skipAnimation ? 1 : 0,
  });

  useEffect(() => {
    // If skipping animation, state is already correct from initial value
    if (skipAnimation) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let animationId: number;
    let startTime = 0;
    let currentPhaseIndex = 0;
    let currentPhase: MaterializePhase = 'hidden';

    const startPhase = (phaseIndex: number) => {
      const phase = PHASE_ORDER[phaseIndex];
      if (!phase) {
        setState({ phase: 'visible', progress: 1 });
        return;
      }

      currentPhase = phase;
      const duration = PHASE_DURATIONS[phase];
      if (duration === 0) {
        // Skip to next phase
        if (phase === 'visible') setState({ phase: 'visible', progress: 1 });
        else startPhase(phaseIndex + 1);

        return;
      }

      startTime = performance.now();

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setState({ phase: currentPhase, progress });

        if (progress < 1) {
          animationId = requestAnimationFrame(animate);
        } else {
          currentPhaseIndex = phaseIndex + 1;
          startPhase(currentPhaseIndex);
        }
      };

      animationId = requestAnimationFrame(animate);
    };

    // Start after delay
    timeoutId = setTimeout(() => {
      currentPhaseIndex = 1; // Skip 'hidden'
      startPhase(currentPhaseIndex);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationId);
    };
  }, [skipAnimation, delay]);

  // If animation should be skipped, return visible state directly
  if (skipAnimation) {
    return {
      phase: 'visible',
      progress: 1,
      isComplete: true,
    };
  }

  return {
    phase: state.phase,
    progress: state.progress,
    isComplete: state.phase === 'visible',
  };
};

/**
 * Get drawing parameters for current materialize phase
 */
export const getMaterializeDrawParams = (phase: MaterializePhase, progress: number) => {
  switch (phase) {
    case 'hidden':
      return { opacity: 0, scale: 0, showCrosshair: false, showWireframe: false, showParticles: false, flashIntensity: 0 };

    case 'crosshair':
      return {
        opacity: progress * 0.8,
        scale: 0,
        showCrosshair: true,
        showWireframe: false,
        showParticles: false,
        flashIntensity: 0,
      };

    case 'wireframe':
      return {
        opacity: 0.8,
        scale: progress * 0.5,
        showCrosshair: true,
        showWireframe: true,
        showParticles: false,
        flashIntensity: 0,
      };

    case 'particles':
      return {
        opacity: 0.8 + progress * 0.2,
        scale: 0.5 + progress * 0.5,
        showCrosshair: progress < 0.5,
        showWireframe: progress < 0.7,
        showParticles: true,
        flashIntensity: 0,
      };

    case 'flash':
      return {
        opacity: 1,
        scale: 1 + (1 - progress) * 0.3,
        showCrosshair: false,
        showWireframe: false,
        showParticles: false,
        flashIntensity: 1 - progress,
      };

    case 'visible':
      return { opacity: 1, scale: 1, showCrosshair: false, showWireframe: false, showParticles: false, flashIntensity: 0 };
  }
};
