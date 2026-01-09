import type { BootMessage, ProgressStage } from './boot-messages';

import { useEffect, useState } from 'react';

import { BOOT_MESSAGES, PROGRESS_STAGES } from './boot-messages';

interface BootAnimationState {
  visibleMessages: BootMessage[];
  currentProgress: {
    stage: ProgressStage | null;
    progress: number; // 0-1
  };
  cursorVisible: boolean;
}

interface UseBootAnimationOptions {
  enabled: boolean;
  elapsed: number; // ms since boot phase started
}

export const useBootAnimation = (options: UseBootAnimationOptions): BootAnimationState => {
  const { enabled, elapsed } = options;

  const [cursorVisible, setCursorVisible] = useState(true);

  // Calculate visible messages based on elapsed time
  const visibleMessages = enabled ? BOOT_MESSAGES.filter(msg => msg.delay <= elapsed) : [];

  // Calculate current progress stage
  const currentStage = PROGRESS_STAGES.find(stage => {
    const stageEnd = stage.startAt + stage.duration;
    return elapsed >= stage.startAt && elapsed < stageEnd;
  });

  const currentProgress = currentStage
    ? {
        stage: currentStage,
        progress: Math.min(1, (elapsed - currentStage.startAt) / currentStage.duration),
      }
    : {
        stage: PROGRESS_STAGES.at(-1) ?? null,
        progress: 1,
      };

  // Cursor blink effect
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, [enabled]);

  return {
    visibleMessages,
    currentProgress,
    cursorVisible,
  };
};
