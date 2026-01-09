import type { ConnectionInfo } from './connection-info';
import type { DOMScanData } from './useDOMScan';
import type { NavigationTimingData } from './useNavigationTiming';

import { useEffect, useMemo, useState } from 'react';

import {
  BASE_BOOT_DURATION,
  type BootContext,
  type BootMessage,
  PROGRESS_STAGES,
  type ProgressStage,
  createBootMessages,
  flattenMessages,
  resolveMessageText,
} from './boot-messages';

export interface FlattenedMessage extends BootMessage {
  depth: number;
  resolvedText: string;
}

interface BootAnimationState {
  // Visible messages with resolved text
  visibleMessages: FlattenedMessage[];
  // All flattened messages for debug mode
  allMessages: FlattenedMessage[];
  // Message depths array for step-over calculation
  messageDepths: number[];
  // Current progress stage
  currentProgress: {
    stage: ProgressStage | null;
    progress: number; // 0-1
  };
  // Overall progress (0-100)
  overallProgress: number;
  // Cursor blink state
  cursorVisible: boolean;
  // Boot context for display
  context: BootContext;
  // Whether all messages have been displayed
  allMessagesDisplayed: boolean;
}

interface UseBootAnimationOptions {
  enabled: boolean;
  elapsed: number; // ms since boot phase started
  // Real data from hooks
  timing: NavigationTimingData;
  dom: DOMScanData;
  connection: ConnectionInfo;
  path: string;
  // Debug mode state
  isDebugMode: boolean;
  isPaused: boolean;
  debugIndex: number;
  maxVisibleDepth: number;
}

/**
 * Calculate adaptive scale factor based on real timing data.
 * Scales the base boot duration to feel proportional to actual load speed.
 */
const calculateScaleFactor = (timing: NavigationTimingData): number => {
  const totalRealTime = timing.total || 500; // Fallback to 500ms if not available

  // Scale factor: faster connections = faster animation (but not too fast)
  // Base: 7s animation for ~700ms real load time
  // Range: 0.7x (fast) to 1.3x (slow)
  const factor = Math.max(0.7, Math.min(1.3, BASE_BOOT_DURATION / Math.max(totalRealTime * 10, 1000)));

  return factor;
};

/**
 * Hook for boot sequence animation with real browser data.
 *
 * Features:
 * - Hierarchical messages with real data interpolation
 * - Adaptive timing based on actual connection speed
 * - Debug mode with stepping support
 */
export const useBootAnimation = (options: UseBootAnimationOptions): BootAnimationState => {
  const { enabled, elapsed, timing, dom, connection, path, isDebugMode, isPaused, debugIndex, maxVisibleDepth } = options;

  const [cursorVisible, setCursorVisible] = useState(true);

  // Build the boot context from real data
  const context: BootContext = useMemo(
    () => ({
      timing,
      dom,
      connection,
      path,
    }),
    [timing, dom, connection, path],
  );

  // Calculate scale factor for adaptive timing
  const scaleFactor = useMemo(() => calculateScaleFactor(timing), [timing]);

  // Create and flatten messages
  const allMessages: FlattenedMessage[] = useMemo(() => {
    const messages = createBootMessages();
    const flattened = flattenMessages(messages);

    // Scale delays and resolve text
    return flattened.map(msg => ({
      ...msg,
      baseDelay: msg.baseDelay * scaleFactor,
      resolvedText: resolveMessageText(msg, context),
    }));
  }, [context, scaleFactor]);

  // Extract depths array for step-over calculation
  const messageDepths = useMemo(() => allMessages.map(msg => msg.depth), [allMessages]);

  // Calculate visible messages based on mode
  const visibleMessages = useMemo(() => {
    if (!enabled) return [];

    if (isDebugMode && isPaused) {
      // In debug mode (paused), show messages up to debugIndex
      return allMessages.slice(0, debugIndex + 1).filter(msg => msg.depth <= maxVisibleDepth);
    }

    // Normal mode or debug mode (running): show messages based on elapsed time
    return allMessages.filter(msg => msg.baseDelay <= elapsed && msg.depth <= maxVisibleDepth);
  }, [enabled, isDebugMode, isPaused, debugIndex, maxVisibleDepth, elapsed, allMessages]);

  // Calculate current progress stage
  const scaledDuration = BASE_BOOT_DURATION * scaleFactor;
  const adjustedElapsed = isDebugMode && isPaused ? (debugIndex / Math.max(allMessages.length, 1)) * scaledDuration : elapsed;

  const currentStage = PROGRESS_STAGES.find(stage => {
    const scaledStart = stage.startAt * scaleFactor;
    const scaledEnd = (stage.startAt + stage.duration) * scaleFactor;
    return adjustedElapsed >= scaledStart && adjustedElapsed < scaledEnd;
  });

  const currentProgress = currentStage
    ? {
        stage: currentStage,
        progress: Math.min(1, (adjustedElapsed - currentStage.startAt * scaleFactor) / (currentStage.duration * scaleFactor)),
      }
    : {
        stage: PROGRESS_STAGES.at(-1) ?? null,
        progress: 1,
      };

  // Overall progress (0-100)
  const overallProgress = Math.min(100, (adjustedElapsed / scaledDuration) * 100);

  // Cursor blink effect
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, [enabled]);

  // Check if all messages have been displayed
  const allMessagesDisplayed = visibleMessages.length >= allMessages.length;

  return {
    visibleMessages,
    allMessages,
    messageDepths,
    currentProgress,
    overallProgress,
    cursorVisible,
    context,
    allMessagesDisplayed,
  };
};
