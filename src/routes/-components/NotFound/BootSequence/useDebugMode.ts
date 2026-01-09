import type { RefObject } from 'react';

import { useCallback, useEffect, useRef, useState } from 'react';

const DEBUG_STORAGE_KEY = '404-debug';

export interface DebugState {
  // Whether debug mode is enabled
  isEnabled: boolean;
  // Whether currently paused at a breakpoint
  isPaused: boolean;
  // Current message index
  debugIndex: number;
  // Max depth to show (for step-over behavior)
  maxVisibleDepth: number;
}

export interface UseDebugModeReturn {
  debugState: DebugState;
  // Actions
  enableDebugMode: () => void;
  disableDebugMode: () => void;
  toggleDebugMode: () => void;
  // Stepping controls (need message count and depths to calculate next index)
  stepContinue: () => void;
  pause: () => void;
  stepOver: (messageDepths: number[]) => void;
  stepInto: (totalMessages: number) => void;
  stepOut: (messageDepths: number[]) => void;
  stepBack: () => void;
  stopDebug: () => void;
  // State updates
  setDebugIndex: (index: number) => void;
  setPaused: (paused: boolean) => void;
  // Check if message at depth should be visible
  isMessageVisible: (depth: number) => boolean;
}

const DEFAULT_STATE: DebugState = {
  isEnabled: false,
  isPaused: false,
  debugIndex: 0,
  maxVisibleDepth: Infinity,
};

/**
 * Hook for IDE-style debug mode with stepping controls.
 *
 * Keyboard shortcuts:
 * - F5 or Ctrl+Shift+D: Toggle debug mode / Continue
 * - F6: Pause (when running)
 * - F10: Step Over (skip children at current depth)
 * - Shift+F10: Step Back (go to previous message)
 * - F11: Step Into (next message) - Note: may trigger fullscreen on some browsers
 * - Shift+F11: Step Out (run until returning to shallower depth)
 * - Escape: Stop debugging
 */
export const useDebugMode = (messageDepths: number[] = [], totalMessages: number = 0, visibleCountRef?: RefObject<number>): UseDebugModeReturn => {
  const [debugState, setDebugState] = useState<DebugState>(() => {
    // Check localStorage for persisted debug mode
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(DEBUG_STORAGE_KEY);
      if (stored === 'true') {
        return { ...DEFAULT_STATE, isEnabled: true, isPaused: true };
      }
    }
    return DEFAULT_STATE;
  });

  // Track if we need to sync debugIndex (loaded from localStorage with debugIndex=0)
  const needsSyncRef = useRef(typeof window !== 'undefined' && localStorage.getItem(DEBUG_STORAGE_KEY) === 'true');

  // Sync debugIndex after mount when loaded from localStorage
  // This prevents the flash where messages appear then reset to index 0
  // Uses polling to wait for visibleCountRef to be populated
  useEffect(() => {
    if (!needsSyncRef.current) return;

    let rafId: number;
    let cancelled = false;

    const checkAndSync = () => {
      if (cancelled) return;

      const currentCount = visibleCountRef?.current ?? 0;
      if (currentCount > 1) {
        // Sync successful - set debugIndex and mark as done
        needsSyncRef.current = false;
        setDebugState(prev => ({
          ...prev,
          debugIndex: Math.max(0, currentCount - 1),
        }));
      } else {
        // Keep polling until visibleCountRef is populated
        rafId = requestAnimationFrame(checkAndSync);
      }
    };

    rafId = requestAnimationFrame(checkAndSync);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [visibleCountRef]);

  // Persist debug mode to localStorage
  const persistDebugMode = useCallback((enabled: boolean) => {
    if (typeof window !== 'undefined') {
      if (enabled) {
        localStorage.setItem(DEBUG_STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(DEBUG_STORAGE_KEY);
      }
    }
  }, []);

  const enableDebugMode = useCallback(() => {
    setDebugState(prev => {
      // Sync debugIndex to current visible count (minimum 1 to show first message)
      const currentCount = visibleCountRef?.current ?? 1;
      const syncedIndex = Math.max(0, currentCount - 1);

      return {
        ...prev,
        isEnabled: true,
        isPaused: true,
        debugIndex: syncedIndex,
        maxVisibleDepth: Infinity,
      };
    });
    persistDebugMode(true);
  }, [persistDebugMode, visibleCountRef]);

  const disableDebugMode = useCallback(() => {
    setDebugState(prev => ({
      ...prev,
      isEnabled: false,
      isPaused: false,
      debugIndex: 0,
    }));
    persistDebugMode(false);
  }, [persistDebugMode]);

  const toggleDebugMode = useCallback(() => {
    setDebugState(prev => {
      const newEnabled = !prev.isEnabled;
      persistDebugMode(newEnabled);
      return {
        ...prev,
        isEnabled: newEnabled,
        isPaused: newEnabled,
        debugIndex: 0,
        maxVisibleDepth: Infinity,
      };
    });
  }, [persistDebugMode]);

  const stepContinue = useCallback(() => {
    setDebugState(prev => {
      if (!prev.isEnabled) return prev;
      return {
        ...prev,
        isPaused: false,
        maxVisibleDepth: Infinity,
      };
    });
  }, []);

  const pause = useCallback(() => {
    setDebugState(prev => {
      if (!prev.isEnabled || prev.isPaused) return prev;
      // Sync debugIndex to current visible count when pausing
      const currentCount = visibleCountRef?.current ?? prev.debugIndex + 1;
      return {
        ...prev,
        isPaused: true,
        debugIndex: Math.max(0, currentCount - 1),
      };
    });
  }, [visibleCountRef]);

  const stepOver = useCallback((depths: number[]) => {
    setDebugState(prev => {
      if (!prev.isEnabled || !prev.isPaused) return prev;

      // Move to next message at same or lower depth
      const currentDepth = depths[prev.debugIndex] ?? 0;
      let nextIndex = prev.debugIndex + 1;

      // Skip children (higher depth)
      while (nextIndex < depths.length && depths[nextIndex]! > currentDepth) {
        nextIndex++;
      }

      if (nextIndex >= depths.length) {
        nextIndex = prev.debugIndex; // Stay at current if at end
      }

      return {
        ...prev,
        debugIndex: nextIndex,
      };
    });
  }, []);

  const stepInto = useCallback((total: number) => {
    setDebugState(prev => {
      if (!prev.isEnabled || !prev.isPaused) return prev;

      const nextIndex = Math.min(prev.debugIndex + 1, total - 1);
      return {
        ...prev,
        debugIndex: nextIndex,
      };
    });
  }, []);

  const stepOut = useCallback((depths: number[]) => {
    setDebugState(prev => {
      if (!prev.isEnabled || !prev.isPaused) return prev;

      // Move to next message at a shallower depth (lower depth number)
      const currentDepth = depths[prev.debugIndex] ?? 0;
      let nextIndex = prev.debugIndex + 1;

      // Skip until we find a shallower depth
      while (nextIndex < depths.length && depths[nextIndex]! >= currentDepth) {
        nextIndex++;
      }

      if (nextIndex >= depths.length) {
        nextIndex = prev.debugIndex; // Stay at current if no shallower level found
      }

      return {
        ...prev,
        debugIndex: nextIndex,
      };
    });
  }, []);

  const stepBack = useCallback(() => {
    setDebugState(prev => {
      if (!prev.isEnabled || !prev.isPaused) return prev;

      // Decrement debugIndex by 1, stay at 0 if already at start
      const prevIndex = Math.max(0, prev.debugIndex - 1);
      return {
        ...prev,
        debugIndex: prevIndex,
      };
    });
  }, []);

  const stopDebug = useCallback(() => {
    setDebugState(prev => ({
      ...prev,
      isEnabled: false,
      isPaused: false,
      debugIndex: 0,
    }));
    persistDebugMode(false);
  }, [persistDebugMode]);

  const setDebugIndex = useCallback((index: number) => {
    setDebugState(prev => ({
      ...prev,
      debugIndex: index,
    }));
  }, []);

  const setPaused = useCallback((paused: boolean) => {
    setDebugState(prev => ({
      ...prev,
      isPaused: paused,
    }));
  }, []);

  const isMessageVisible = useCallback(
    (depth: number): boolean => {
      if (!debugState.isEnabled) return true;
      return depth <= debugState.maxVisibleDepth;
    },
    [debugState.isEnabled, debugState.maxVisibleDepth],
  );

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F5 or Ctrl+Shift+D - Toggle debug mode / Continue
      if (e.key === 'F5' || (e.ctrlKey && e.shiftKey && e.key === 'D')) {
        e.preventDefault();
        if (!debugState.isEnabled) {
          enableDebugMode();
        } else if (debugState.isPaused) {
          stepContinue();
        }
        return;
      }

      // Only handle other keys if debug mode is enabled
      if (!debugState.isEnabled) return;

      // F6 - Pause (when running)
      if (e.key === 'F6') {
        e.preventDefault();
        pause();
        return;
      }

      // Shift+F10 - Step Back (go to previous message)
      // Must be checked before F10 (Step Over)
      if (e.shiftKey && e.key === 'F10') {
        e.preventDefault();
        stepBack();
        return;
      }

      // F10 - Step Over
      if (e.key === 'F10') {
        e.preventDefault();
        stepOver(messageDepths);
        return;
      }

      // Shift+F11 - Step Out (run until shallower depth)
      // Must be checked before F11 (Step Into)
      if (e.shiftKey && e.key === 'F11') {
        e.preventDefault();
        stepOut(messageDepths);
        return;
      }

      // F11 - Step Into (note: may trigger fullscreen on some browsers)
      // At last message, continue instead of stepping
      if (e.key === 'F11') {
        e.preventDefault();
        if (debugState.debugIndex >= totalMessages - 1) {
          stepContinue();
        } else {
          stepInto(totalMessages);
        }
        return;
      }

      // Escape - Stop debugging
      if (e.key === 'Escape') {
        e.preventDefault();
        stopDebug();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    debugState.isEnabled,
    debugState.isPaused,
    enableDebugMode,
    stepContinue,
    pause,
    stepOver,
    stepInto,
    stepOut,
    stepBack,
    stopDebug,
    messageDepths,
    totalMessages,
    debugState.debugIndex,
  ]);

  return {
    debugState,
    enableDebugMode,
    disableDebugMode,
    toggleDebugMode,
    stepContinue,
    pause,
    stepOver,
    stepInto,
    stepOut,
    stepBack,
    stopDebug,
    setDebugIndex,
    setPaused,
    isMessageVisible,
  };
};

/**
 * Check if debug mode is enabled (for conditional rendering)
 */
export const isDebugModeEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DEBUG_STORAGE_KEY) === 'true';
};
