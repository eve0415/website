import { useEffect, useMemo, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

// Real programming error messages organized by stage
// Stage 1: 404/Not Found errors (slow, readable)
// Stage 2: Escalating errors (medium speed)
// Stage 3: Catastrophic errors (rapid fire)
export interface ErrorMessage {
  text: string;
  stage: 1 | 2 | 3;
  language?: string; // For styling hints
}

export const ERROR_MESSAGES: ErrorMessage[] = [
  // Stage 1 - 404/Not Found errors
  { text: 'FileNotFoundException: /page not found', stage: 1, language: 'java' },
  { text: "ENOENT: no such file or directory, open '/page'", stage: 1, language: 'node' },
  { text: "KeyError: 'page' not in routes", stage: 1, language: 'python' },
  { text: "undefined is not an object (evaluating 'page.render')", stage: 1, language: 'javascript' },

  // Stage 2 - Escalating errors
  { text: 'java.lang.NullPointerException', stage: 2, language: 'java' },
  { text: "TypeError: Cannot read property 'x' of null", stage: 2, language: 'javascript' },
  { text: 'IndexOutOfBoundsException: index 404', stage: 2, language: 'java' },
  { text: 'panic: runtime error: index out of range [404]', stage: 2, language: 'go' },

  // Stage 3 - Catastrophic errors
  { text: 'StackOverflowError', stage: 3, language: 'java' },
  { text: 'Segmentation fault (core dumped)', stage: 3, language: 'c' },
  { text: 'FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed', stage: 3, language: 'node' },
  { text: 'Kernel panic - not syncing: Fatal exception', stage: 3, language: 'kernel' },
];

export interface CorruptionState {
  intensity: number; // 0-1
  glitchLines: GlitchLine[];
  staticOpacity: number;
  scanlineOffset: number;
  currentError: ErrorMessage | null;
  errorOpacity: number;
}

export interface GlitchLine {
  id: number;
  y: number;
  width: number;
  offset: number;
  opacity: number;
  jitter: number;
}

interface UseCorruptionEffectsOptions {
  enabled: boolean;
  progress: number; // 0-1 through corruption phase
}

// Get error based on progress with dynamic timing
// Stage 1: 0-0.4 (40% of time, ~4 errors, slow)
// Stage 2: 0.4-0.7 (30% of time, ~4 errors, medium)
// Stage 3: 0.7-1.0 (30% of time, ~4 errors, rapid)
const getErrorForProgress = (progress: number): ErrorMessage | null => {
  if (progress < 0.05) return null;

  const stage1Errors = ERROR_MESSAGES.filter(e => e.stage === 1);
  const stage2Errors = ERROR_MESSAGES.filter(e => e.stage === 2);
  const stage3Errors = ERROR_MESSAGES.filter(e => e.stage === 3);

  if (progress < 0.4) {
    // Stage 1: slow, each error shows for ~10% of progress
    const index = Math.floor((progress - 0.05) / 0.0875);
    return stage1Errors[Math.min(index, stage1Errors.length - 1)] ?? null;
  }

  if (progress < 0.7) {
    // Stage 2: medium speed
    const stageProgress = (progress - 0.4) / 0.3;
    const index = Math.floor(stageProgress * stage2Errors.length);
    return stage2Errors[Math.min(index, stage2Errors.length - 1)] ?? null;
  }

  // Stage 3: rapid
  const stageProgress = (progress - 0.7) / 0.3;
  const index = Math.floor(stageProgress * stage3Errors.length);
  return stage3Errors[Math.min(index, stage3Errors.length - 1)] ?? null;
};

export const useCorruptionEffects = (options: UseCorruptionEffectsOptions): CorruptionState => {
  const { enabled, progress } = options;
  const reducedMotion = useReducedMotion();

  const [glitchLines, setGlitchLines] = useState<GlitchLine[]>([]);
  const [scanlineOffset, setScanlineOffset] = useState(0);

  // Calculate intensity based on progress (accelerating)
  const intensity = useMemo(() => {
    if (!enabled) return 0;
    // Exponential ramp up
    return Math.pow(progress, 1.5);
  }, [enabled, progress]);

  // Static noise opacity increases with progress
  const staticOpacity = useMemo(() => {
    if (!enabled) return 0;
    return Math.min(0.15, progress * 0.2);
  }, [enabled, progress]);

  // Current error based on progress
  const currentError = useMemo(() => {
    if (!enabled) return null;
    return getErrorForProgress(progress);
  }, [enabled, progress]);

  // Error opacity - pulses when switching errors
  const errorOpacity = useMemo(() => {
    if (!enabled || !currentError) return 0;

    // Higher opacity in later stages
    const baseOpacity = currentError.stage === 1 ? 0.8 : currentError.stage === 2 ? 0.9 : 1;

    // Slight pulse effect based on progress micro-cycles
    const pulse = Math.sin(progress * 50) * 0.1;
    return Math.min(1, baseOpacity + pulse);
  }, [enabled, currentError, progress]);

  // Generate glitch lines - only update via interval callback, not synchronously
  useEffect(() => {
    if (!enabled || reducedMotion) return;

    const generateLines = () => {
      const lineCount = Math.floor(intensity * 8) + 1;
      const newLines: GlitchLine[] = [];

      for (let i = 0; i < lineCount; i++) {
        newLines.push({
          id: i,
          y: Math.random() * 100,
          width: 20 + Math.random() * 60,
          offset: (Math.random() - 0.5) * 20,
          opacity: 0.3 + Math.random() * 0.5,
          jitter: (Math.random() - 0.5) * 10,
        });
      }

      setGlitchLines(newLines);
    };

    // Regenerate glitch lines at intervals - faster in later stages
    const baseInterval = 200 - intensity * 150;
    const interval = setInterval(generateLines, Math.max(50, baseInterval));

    return () => clearInterval(interval);
  }, [enabled, intensity, reducedMotion]);

  // Return empty lines when disabled (derived, not via setState)
  const effectiveGlitchLines = enabled ? glitchLines : [];

  // Animate scanline
  useEffect(() => {
    if (!enabled || reducedMotion) return;

    const animate = () => {
      setScanlineOffset(prev => (prev + 2) % 100);
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, [enabled, reducedMotion]);

  return {
    intensity,
    glitchLines: effectiveGlitchLines,
    staticOpacity,
    scanlineOffset,
    currentError,
    errorOpacity,
  };
};

// Get color class for error language
export const getErrorColorClass = (language?: string): string => {
  switch (language) {
    case 'java':
      return 'text-orange';
    case 'python':
      return 'text-yellow-400';
    case 'javascript':
    case 'node':
      return 'text-yellow-300';
    case 'go':
      return 'text-cyan';
    case 'c':
    case 'kernel':
      return 'text-red-500';
    default:
      return 'text-red-400';
  }
};
