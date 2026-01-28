import type { FC } from 'react';

interface DebugToolbarProps {
  isPaused: boolean;
  currentIndex: number;
  totalMessages: number;
  onContinue: () => void;
  onPause: () => void;
  onStepOver: () => void;
  onStepInto: () => void;
  onStepOut: () => void;
  onStepBack: () => void;
  onStop: () => void;
}

/**
 * VS Code-style debug toolbar with stepping controls.
 * Shows at top of boot sequence when debug mode is active.
 */
export const DebugToolbar: FC<DebugToolbarProps> = ({
  isPaused,
  currentIndex,
  totalMessages,
  onContinue,
  onPause,
  onStepOver,
  onStepInto,
  onStepOut,
  onStepBack,
  onStop,
}) => (
  <div className='fixed top-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-amber-500/30 bg-neutral-900/95 px-2 py-1.5 font-mono text-xs shadow-lg shadow-amber-500/10 backdrop-blur-sm'>
    {/* Debug indicator */}
    <div className='mr-2 flex items-center gap-1.5'>
      <span className={`size-2 rounded-full ${isPaused ? 'animate-pulse bg-amber-500' : 'bg-green-500'}`} />
      <span className='text-neutral-400'>DEBUG</span>
    </div>

    {/* Progress indicator */}
    <div className='mr-3 border-l border-neutral-700 pl-3 text-neutral-400'>
      <span className='text-neutral-300 tabular-nums'>{currentIndex + 1}</span>
      <span className='mx-0.5'>/</span>
      <span className='tabular-nums'>{totalMessages}</span>
    </div>

    {/* Continue/Pause toggle */}
    {isPaused ? (
      <button
        type='button'
        onClick={onContinue}
        className='flex items-center gap-1 rounded px-2 py-1 text-green-400 transition-colors hover:bg-green-500/20'
        title='Continue (F5)'
      >
        <ContinueIcon />
        <span className='hidden sm:inline'>Continue</span>
        <kbd className='ml-1 rounded bg-neutral-800 px-1 text-[10px] text-neutral-400'>F5</kbd>
      </button>
    ) : (
      <button
        type='button'
        onClick={onPause}
        className='flex items-center gap-1 rounded px-2 py-1 text-amber-400 transition-colors hover:bg-amber-500/20'
        title='Pause (F6)'
      >
        <PauseIcon />
        <span className='hidden sm:inline'>Pause</span>
        <kbd className='ml-1 rounded bg-neutral-800 px-1 text-[10px] text-neutral-400'>F6</kbd>
      </button>
    )}

    {/* Step Over button */}
    <button
      type='button'
      onClick={onStepOver}
      disabled={!isPaused}
      className='flex items-center gap-1 rounded px-2 py-1 text-cyan-400 transition-colors hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50'
      title='Step Over (F10)'
    >
      <StepOverIcon />
      <span className='hidden sm:inline'>Step Over</span>
      <kbd className='ml-1 rounded bg-neutral-800 px-1 text-[10px] text-neutral-400'>F10</kbd>
    </button>

    {/* Step Back button */}
    <button
      type='button'
      onClick={onStepBack}
      disabled={!isPaused || currentIndex === 0}
      className='flex items-center gap-1 rounded px-2 py-1 text-orange-400 transition-colors hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50'
      title='Step Back (Shift+F10)'
    >
      <StepBackIcon />
      <span className='hidden sm:inline'>Step Back</span>
      <kbd className='ml-1 rounded bg-neutral-800 px-1 text-[10px] text-neutral-400'>⇧F10</kbd>
    </button>

    {/* Step Into button */}
    <button
      type='button'
      onClick={onStepInto}
      disabled={!isPaused}
      className='flex items-center gap-1 rounded px-2 py-1 text-blue-400 transition-colors hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50'
      title='Step Into (F11)'
    >
      <StepIntoIcon />
      <span className='hidden sm:inline'>Step Into</span>
      <kbd className='ml-1 rounded bg-neutral-800 px-1 text-[10px] text-neutral-400'>F11</kbd>
    </button>

    {/* Step Out button */}
    <button
      type='button'
      onClick={onStepOut}
      disabled={!isPaused}
      className='flex items-center gap-1 rounded px-2 py-1 text-purple-400 transition-colors hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50'
      title='Step Out (Shift+F11)'
    >
      <StepOutIcon />
      <span className='hidden sm:inline'>Step Out</span>
      <kbd className='ml-1 rounded bg-neutral-800 px-1 text-[10px] text-neutral-400'>⇧F11</kbd>
    </button>

    {/* Stop button */}
    <button
      type='button'
      onClick={onStop}
      className='flex items-center gap-1 rounded px-2 py-1 text-red-400 transition-colors hover:bg-red-500/20'
      title='Stop (Esc)'
    >
      <StopIcon />
      <span className='hidden sm:inline'>Stop</span>
      <kbd className='ml-1 rounded bg-neutral-800 px-1 text-[10px] text-neutral-400'>Esc</kbd>
    </button>
  </div>
);

// VS Code-style icons

const ContinueIcon: FC = () => (
  <svg className='size-4' viewBox='0 0 16 16' fill='currentColor'>
    <path d='M3 2v12l10-6L3 2z' />
  </svg>
);

const PauseIcon: FC = () => (
  <svg className='size-4' viewBox='0 0 16 16' fill='currentColor'>
    <rect x='3' y='2' width='4' height='12' rx='1' />
    <rect x='9' y='2' width='4' height='12' rx='1' />
  </svg>
);

const StepOverIcon: FC = () => (
  <svg className='size-4' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.5'>
    <circle cx='8' cy='12' r='2.5' />
    <path d='M4 5h8M8 5V2M12 5l-2-2M12 5l-2 2' />
  </svg>
);

const StepIntoIcon: FC = () => (
  <svg className='size-4' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.5'>
    <circle cx='8' cy='12' r='2.5' />
    <path d='M8 2v6M5 5l3 3 3-3' />
  </svg>
);

const StepBackIcon: FC = () => (
  <svg className='size-4' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.5'>
    <circle cx='8' cy='12' r='2.5' />
    <path d='M8 2v6M5 8l3-3 3 3' />
  </svg>
);

const StepOutIcon: FC = () => (
  <svg className='size-4' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.5'>
    <circle cx='8' cy='4' r='2.5' />
    <path d='M8 14V8M5 11l3-3 3 3' />
  </svg>
);

const StopIcon: FC = () => (
  <svg className='size-4' viewBox='0 0 16 16' fill='currentColor'>
    <rect x='3' y='3' width='10' height='10' rx='1' />
  </svg>
);
