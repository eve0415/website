import { useEffect, useMemo, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

export interface CorruptionState {
  intensity: number; // 0-1
  glitchLines: GlitchLine[];
  staticOpacity: number;
  scanlineOffset: number;
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

export const useCorruptionEffects = (options: UseCorruptionEffectsOptions): CorruptionState => {
  const { enabled, progress } = options;
  const reducedMotion = useReducedMotion();

  const [glitchLines, setGlitchLines] = useState<GlitchLine[]>([]);
  const [scanlineOffset, setScanlineOffset] = useState(0);

  // Calculate intensity based on progress (accelerating)
  const intensity = useMemo(() => {
    if (!enabled) return 0;
    // Exponential ramp up
    return progress ** 1.5;
  }, [enabled, progress]);

  // Static noise opacity increases with progress
  const staticOpacity = useMemo(() => {
    if (!enabled) return 0;
    return Math.min(0.15, progress * 0.2);
  }, [enabled, progress]);

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

    return () => {
      clearInterval(interval);
    };
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
    return () => {
      clearInterval(interval);
    };
  }, [enabled, reducedMotion]);

  return {
    intensity,
    glitchLines: effectiveGlitchLines,
    staticOpacity,
    scanlineOffset,
  };
};
