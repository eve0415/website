import type { FC } from 'react';

export interface ProgressBarProps {
  /** Current stage label (e.g., "Network", "TLS", "Render") */
  stageLabel: string;
  /** Progress within current stage (0-1) */
  progress: number;
}

/**
 * Progress bar component for the boot sequence.
 *
 * Displays current stage label, percentage, and a visual fill bar.
 * Uses direct width updates without CSS transitions to work with RAF-based animations.
 */
const ProgressBar: FC<ProgressBarProps> = ({ stageLabel, progress }) => {
  const percentage = Math.round(progress * 100);

  return (
    <div className='border-line/30 border-t px-4 py-3'>
      <div className='mb-1 flex justify-between text-muted-foreground text-xs'>
        <span data-testid='stage-label'>{stageLabel}</span>
        <span className='tabular-nums' data-testid='percentage'>
          {percentage}%
        </span>
      </div>
      <div className='h-1.5 overflow-hidden rounded-full bg-line/30'>
        <div data-testid='progress-fill' className='h-full rounded-full bg-linear-to-r from-cyan to-neon' style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
};

export default ProgressBar;
