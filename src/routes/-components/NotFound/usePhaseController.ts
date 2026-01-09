import { useCallback, useEffect, useRef, useState } from 'react';

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
  totalElapsed: number; // ms since mount
}

interface UsePhaseControllerOptions {
  skipToAftermath?: boolean; // For reduced motion
  onPhaseChange?: (phase: Phase) => void;
  debugPaused?: boolean; // Block auto-advance when debug mode is paused
}

export const usePhaseController = (options: UsePhaseControllerOptions = {}) => {
  const { skipToAftermath = false, onPhaseChange, debugPaused = false } = options;

  const [state, setState] = useState<PhaseState>(() => ({
    current: skipToAftermath ? 'aftermath' : 'boot',
    progress: skipToAftermath ? 1 : 0,
    elapsed: 0,
    totalElapsed: 0,
  }));

  const startTimeRef = useRef<number>(0);
  const phaseStartTimeRef = useRef<number>(0);
  const animationRef = useRef<number>(0);
  const phaseRef = useRef<Phase>(state.current);
  const debugPausedRef = useRef(debugPaused);

  // Keep debugPaused ref in sync (must be in effect, not render)
  useEffect(() => {
    debugPausedRef.current = debugPaused;
  }, [debugPaused]);

  const advancePhase = useCallback(() => {
    const config = PHASE_CONFIG[phaseRef.current];
    if (config.next) {
      phaseRef.current = config.next;
      setState(prev => ({
        ...prev,
        current: config.next!,
        progress: 0,
        elapsed: 0,
      }));
      phaseStartTimeRef.current = performance.now();
      onPhaseChange?.(config.next);
    }
  }, [onPhaseChange]);

  // Force advance to specific phase (for debugging/testing)
  const jumpToPhase = useCallback(
    (phase: Phase) => {
      phaseRef.current = phase;
      setState(prev => ({
        ...prev,
        current: phase,
        progress: 0,
        elapsed: 0,
      }));
      phaseStartTimeRef.current = performance.now();
      onPhaseChange?.(phase);
    },
    [onPhaseChange],
  );

  useEffect(() => {
    if (skipToAftermath) return;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === 0) {
        startTimeRef.current = timestamp;
        phaseStartTimeRef.current = timestamp;
      }

      const totalElapsed = timestamp - startTimeRef.current;
      const phaseElapsed = timestamp - phaseStartTimeRef.current;
      const currentPhase = phaseRef.current;
      const config = PHASE_CONFIG[currentPhase];

      // Calculate progress (0-1)
      const progress = config.duration > 0 ? Math.min(1, phaseElapsed / config.duration) : 1;

      setState(prev => ({
        ...prev,
        progress,
        elapsed: phaseElapsed,
        totalElapsed,
      }));

      // Auto-advance to next phase (blocked when debug mode is paused)
      if (config.duration > 0 && phaseElapsed >= config.duration && config.next && !debugPausedRef.current) {
        phaseRef.current = config.next;
        setState(prev => ({
          ...prev,
          current: config.next!,
          progress: 0,
          elapsed: 0,
        }));
        phaseStartTimeRef.current = timestamp;
        onPhaseChange?.(config.next);
      }

      // Continue animation unless we're in aftermath (check updated ref)
      if (phaseRef.current !== 'aftermath') {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [skipToAftermath, onPhaseChange]);

  return {
    ...state,
    advancePhase,
    jumpToPhase,
    isPhase: (phase: Phase) => state.current === phase,
    isPastPhase: (phase: Phase) => {
      const order: Phase[] = ['boot', 'corruption', 'aftermath'];
      return order.indexOf(state.current) > order.indexOf(phase);
    },
  };
};
