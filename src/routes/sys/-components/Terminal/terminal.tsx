import type { GitHubStats } from '../../-utils/github-stats-utils';
import type { CommandContext } from './commands';
import type { TerminalLine } from './useTerminal';
import type { FC, ReactNode } from 'react';

import { useNavigate } from '@tanstack/react-router';
import { startTransition, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { COMMAND_NAMES, SudoRmRfError, executeCommand } from './commands';
import { useKeyboardCapture } from './useKeyboardCapture';
import { useTerminal } from './useTerminal';
import { useTypingAnimation } from './useTypingAnimation';

interface TerminalProps {
  stats: GitHubStats;
  /** Content to show after boot sequence completes */
  children: ReactNode;
  /** Called when boot animation (typing + Enter) completes and content should start loading */
  onBootComplete: () => void;
  /**
   * Internal: Force touch device mode for testing.
   * @internal - Do not use in production code
   */
  __forceTouchDevice?: boolean;
}

const INITIAL_COMMAND = 'sys.diagnostic --user=eve0415';

// Touch device detection using useSyncExternalStore to avoid setState in effect
// oxlint-disable-next-line eslint-plugin-promise(prefer-await-to-callbacks) -- useSyncExternalStore requires callback subscription pattern
const subscribeTouchDevice = (callback: () => void) => {
  const coarseQuery = globalThis.matchMedia('(pointer: coarse)');
  const fineQuery = globalThis.matchMedia('(pointer: fine)');
  coarseQuery.addEventListener('change', callback);
  fineQuery.addEventListener('change', callback);
  return () => {
    coarseQuery.removeEventListener('change', callback);
    fineQuery.removeEventListener('change', callback);
  };
};

const getIsTouchDevice = () => globalThis.matchMedia('(pointer: coarse)').matches && !globalThis.matchMedia('(pointer: fine)').matches;

const getServerIsTouchDevice = () => false;

/**
 * Check if device is touch-only (mobile/tablet).
 * Returns true for devices without precise pointer (mouse).
 */
const useIsTouchDevice = (): boolean => useSyncExternalStore(subscribeTouchDevice, getIsTouchDevice, getServerIsTouchDevice);

const Terminal: FC<TerminalProps> = ({ stats, children, onBootComplete, __forceTouchDevice }) => {
  const navigate = useNavigate();
  const detectedTouchDevice = useIsTouchDevice();
  const isTouchDevice = __forceTouchDevice ?? detectedTouchDevice;
  const promptRef = useRef<HTMLDivElement>(null);
  const [isCrashing, setIsCrashing] = useState(false);
  const [pendingError, setPendingError] = useState<Error | null>();

  // Store callback in ref to avoid effect re-runs when callback reference changes
  const onBootCompleteRef = useRef(onBootComplete);
  useEffect(() => {
    onBootCompleteRef.current = onBootComplete;
  });

  // Throw pending error during render so React's error boundary catches it
  if (pendingError) throw pendingError;

  const {
    state,
    lines,
    awaitingConfirmation,
    contentVisible,
    bootCommandVisible,
    interruptedText,
    onTypingDone,
    onCtrlC,
    executeCommand: terminalExecute,
    clear,
    awaitConfirmation,
    confirm,
    addOutput,
    showDiagnostic,
  } = useTerminal();

  // Typing animation for initial command
  const { displayedText, cursorVisible } = useTypingAnimation(INITIAL_COMMAND, {
    enabled: state === 'typing',
    onComplete: onTypingDone,
  });

  // For touch devices: auto-trigger boot complete when typing finishes
  // Desktop users must press Ctrl+C to dismiss content
  const bootTriggeredRef = useRef(false);
  useEffect(() => {
    if (!isTouchDevice || state !== 'displaying' || bootTriggeredRef.current) return;

    bootTriggeredRef.current = true;
    // Notify parent that boot is complete (for animations)
    onBootCompleteRef.current();
  }, [isTouchDevice, state]);

  // Navigation helper
  const handleNavigateHome = useCallback(() => {
    startTransition(async () => {
      await navigate({ to: '/' });
    });
  }, [navigate]);

  // Scroll to prompt after command execution
  const scrollToPrompt = useCallback(() => {
    // Use setTimeout to ensure DOM has updated before scrolling
    setTimeout(() => {
      promptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 0);
  }, []);

  // Command context for execution
  const commandContext: CommandContext = useMemo(
    () => ({
      stats,
      onNavigateHome: handleNavigateHome,
    }),
    [stats, handleNavigateHome],
  );

  // Handle command submission
  const handleCommandSubmit = useCallback(
    (input: string) => {
      // If awaiting confirmation (exit? y/n)
      if (awaitingConfirmation) {
        const isYes = input.toLowerCase() === 'y' || input.toLowerCase() === 'yes';
        confirm(isYes);
        if (isYes && awaitingConfirmation === 'exit') handleNavigateHome();

        scrollToPrompt();
        return;
      }

      const result = executeCommand(input, commandContext);

      switch (result.type) {
        case 'output':
          terminalExecute(input, result.content);
          break;
        case 'error':
          terminalExecute(input, <span className='text-red-400'>{result.message}</span>, true);
          break;
        case 'clear':
          clear();
          break;
        case 'exit':
          if (result.needsConfirmation) {
            awaitConfirmation('exit');
            addOutput(<span>exit? (y/n)</span>);
          } else {
            handleNavigateHome();
          }
          break;
        case 'crash':
          // Trigger crash animation then propagate error to React's error boundary
          setIsCrashing(true);
          terminalExecute(input, <span className='text-red-400'>Executing...</span>);
          setTimeout(() => {
            setPendingError(new SudoRmRfError());
          }, 1500);
          break;
        case 'diagnostic':
          // Add command to history and show diagnostic content
          terminalExecute(input, null);
          showDiagnostic();
          break;
      }

      // Scroll to prompt after command execution
      scrollToPrompt();
    },
    [awaitingConfirmation, confirm, commandContext, terminalExecute, clear, awaitConfirmation, addOutput, handleNavigateHome, showDiagnostic, scrollToPrompt],
  );

  // Handle Ctrl+C - use ref to avoid effect re-runs during typing animation
  const handleCtrlC = useCallback(() => {
    if (state === 'typing') {
      // Pass partial text to show "command^C" in header
      onCtrlC(displayedText);
    } else if (state === 'displaying') {
      // Dismiss content and show prompt
      onCtrlC();
      // Notify parent for any cleanup/state updates
      onBootCompleteRef.current();
    } else {
      // In prompt state: just clear input
      onCtrlC();
    }
  }, [state, onCtrlC, displayedText]);

  // Ref to hold current handler for use in effect
  const handleCtrlCRef = useRef(handleCtrlC);
  useEffect(() => {
    handleCtrlCRef.current = handleCtrlC;
  }, [handleCtrlC]);

  // Keyboard capture (only on desktop and when in prompt state)
  const keyboardEnabled = !isTouchDevice && state === 'prompt';
  const {
    input: keyboardInput,
    cursorPosition,
    suggestions,
  } = useKeyboardCapture({
    enabled: keyboardEnabled,
    commands: COMMAND_NAMES,
    onSubmit: handleCommandSubmit,
    onCtrlC: handleCtrlC,
  });

  // Listen for Ctrl+C during typing/displaying states (not handled by keyboard capture)
  useEffect(() => {
    if (isTouchDevice || state === 'prompt') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        handleCtrlCRef.current();
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => {
      globalThis.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTouchDevice, state]);

  // Determine if we should show the children (boot content)
  const showContent = contentVisible;

  return (
    <div className={`relative ${isCrashing ? 'animate-tv-static' : ''}`}>
      {/* Terminal header with command (hidden after clear) */}
      {bootCommandVisible && (
        <header data-testid='terminal-header' className='mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
          <h1 className='text-neon font-mono text-lg md:text-xl'>
            <span className='text-subtle-foreground'>&gt; </span>
            {state === 'typing' ? (
              <>
                {displayedText}
                <span data-testid='terminal-cursor' className={`${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                  _
                </span>
              </>
            ) : interruptedText ? (
              <>
                {interruptedText.slice(0, -2)}
                <span className='text-red-400'>^C</span>
              </>
            ) : (
              INITIAL_COMMAND
            )}
          </h1>
          {showContent && (
            <div className='text-subtle-foreground font-mono text-xs'>
              <span>最終更新: </span>
              <span>{new Date(stats.cachedAt).toLocaleDateString('ja-JP')}</span>
            </div>
          )}
        </header>
      )}

      {/* Terminal output area (for command history in prompt mode) */}
      {state === 'prompt' && lines.length > 0 && (
        <div data-testid='terminal-output' className='font-mono text-sm'>
          {lines.map((line: TerminalLine, index: number) => (
            <div
              key={line.id}
              className={`${index > 0 && line.type === 'command' ? 'mt-4' : ''} ${line.type === 'error' ? 'text-red-400' : ''} ${line.type === 'command' ? 'text-subtle-foreground' : ''}`}
            >
              {line.content}
            </div>
          ))}

          {/* Autocomplete suggestions */}
          {suggestions.length > 0 && (
            <div className='text-subtle-foreground mt-2'>
              {suggestions.map(s => (
                <span key={s} className='mr-4'>
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main content area */}
      {showContent && children}

      {/* Prompt line (desktop only, prompt state) */}
      {state === 'prompt' && !isTouchDevice && (
        <div ref={promptRef} className='mt-4'>
          <div className='font-mono text-sm'>
            <span className='text-subtle-foreground'>&gt; </span>
            <span data-testid='terminal-input' className='text-foreground'>
              {awaitingConfirmation ? '' : keyboardInput.slice(0, cursorPosition)}
            </span>
            <span data-testid='terminal-prompt-cursor' className='animate-blink'>
              |
            </span>
            <span className='text-foreground'>{awaitingConfirmation ? '' : keyboardInput.slice(cursorPosition)}</span>
          </div>
        </div>
      )}

      {/* Footer hint - only in prompt mode */}
      {state === 'prompt' && !isTouchDevice && (
        <footer data-testid='terminal-footer' className='text-subtle-foreground mt-8 flex items-center justify-center gap-2 text-xs'>
          {/* oxlint-disable-next-line eslint-plugin-react(no-unescaped-entities) -- Terminal-style text with quotes */}
          <span className='font-mono'># type 'help' for commands</span>
        </footer>
      )}
    </div>
  );
};

export default Terminal;
