import { useEffect, useRef, useState } from 'react';

export type Phase = 'boot' | 'corruption' | 'aftermath';

interface PhaseConfig {
  duration: number; // ms, 0 = indefinite
  next: Phase | null;
}

const PHASE_CONFIG: Record<Phase, PhaseConfig> = {
  boot: { duration: 7000, next: 'corruption' },
  corruption: { duration: 3500, next: 'aftermath' }, // Extended for readable error cascade
  aftermath: { duration: 0, next: null },
};

export interface PhaseState {
  current: Phase;
  progress: number; // 0-1 within current phase
  elapsed: number; // ms since phase started
}

interface UsePhaseControllerOptions {
  skipToAftermath?: boolean; // For reduced motion
  onPhaseChange?: (phase: Phase) => void;
  debugPaused?: boolean; // Block auto-advance when debug mode is paused
  bootComplete?: boolean; // Whether boot sequence has displayed all messages
}

export const usePhaseController = (options: UsePhaseControllerOptions = {}) => {
  const { skipToAftermath = false, onPhaseChange, debugPaused = false, bootComplete = false } = options;

  const [state, setState] = useState<PhaseState>(() => ({
    current: skipToAftermath ? 'aftermath' : 'boot',
    progress: skipToAftermath ? 1 : 0,
    elapsed: 0,
  }));

  const phaseStartTimeRef = useRef<number>(0);
  const animationRef = useRef<number>(0);
  const phaseRef = useRef<Phase>(state.current);
  const debugPausedRef = useRef(debugPaused);
  const bootCompleteRef = useRef(bootComplete);

  // Pause time tracking for elapsed freeze/resume
  const phasePauseOffsetRef = useRef<number>(0); // Pause offset for current phase
  const phasePausedAtRef = useRef<number | null>(null); // Phase elapsed when pause started

  // Keep bootComplete ref in sync
  useEffect(() => {
    bootCompleteRef.current = bootComplete;
  }, [bootComplete]);

  // Keep debugPaused ref in sync and track pause transitions
  useEffect(() => {
    const wasPaused = debugPausedRef.current;
    debugPausedRef.current = debugPaused;

    if (debugPaused && !wasPaused) {
      // Entering pause: capture current phase elapsed
      const now = performance.now();
      if (phaseStartTimeRef.current > 0) {
        phasePausedAtRef.current = now - phaseStartTimeRef.current - phasePauseOffsetRef.current;
      }
    } else if (!debugPaused && wasPaused) {
      // Leaving pause: calculate how long we were paused and add to offset
      const now = performance.now();
      if (phasePausedAtRef.current !== null && phaseStartTimeRef.current > 0) {
        const currentRawPhaseElapsed = now - phaseStartTimeRef.current;
        const phasePauseDuration = currentRawPhaseElapsed - phasePausedAtRef.current - phasePauseOffsetRef.current;
        phasePauseOffsetRef.current += phasePauseDuration;
      }
      phasePausedAtRef.current = null;
    }
  }, [debugPaused]);

  useEffect(() => {
    if (skipToAftermath) return;

    const animate = (timestamp: number) => {
      if (phaseStartTimeRef.current === 0) phaseStartTimeRef.current = timestamp;

      // Calculate elapsed with pause offset adjustment
      // When paused, use frozen value; when running, subtract accumulated pause time
      const phaseElapsed = debugPausedRef.current ? (phasePausedAtRef.current ?? 0) : timestamp - phaseStartTimeRef.current - phasePauseOffsetRef.current;
      const currentPhase = phaseRef.current;
      const config = PHASE_CONFIG[currentPhase];

      // Calculate progress (0-1)
      const progress = config.duration > 0 ? Math.min(1, phaseElapsed / config.duration) : 1;

      setState(prev => ({
        ...prev,
        progress,
        elapsed: phaseElapsed,
      }));

      // Auto-advance to next phase (blocked when debug mode is paused or boot not complete)
      // For boot phase, require bootComplete to prevent premature transition when exiting debug mode
      const canAdvanceFromBoot = currentPhase !== 'boot' || bootCompleteRef.current;
      const nextPhase = config.next;
      if (config.duration > 0 && phaseElapsed >= config.duration && nextPhase && !debugPausedRef.current && canAdvanceFromBoot) {
        phaseRef.current = nextPhase;
        setState(prev => ({
          ...prev,
          current: nextPhase,
          progress: 0,
          elapsed: 0,
        }));
        phaseStartTimeRef.current = timestamp;
        onPhaseChange?.(nextPhase);
      }

      // Continue animation unless we're in aftermath (check updated ref)
      if (phaseRef.current !== 'aftermath') animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [skipToAftermath, onPhaseChange]);

  return {
    ...state,
    isPhase: (phase: Phase) => state.current === phase,
  };
};
