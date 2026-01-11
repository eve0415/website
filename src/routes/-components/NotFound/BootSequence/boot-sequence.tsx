import type { MouseInfluence } from '../useMouseInfluence';
import type { ConnectionInfo } from './connection-info';
import type { FC } from 'react';

import { useEffect, useMemo, useRef, useState } from 'react';

import { getConnectionInfo } from './connection-info';
import { DebugToolbar } from './DebugToolbar/debug-toolbar';
import { useAutoScroll } from './useAutoScroll';
import { useBootAnimation } from './useBootAnimation';
import { useDebugMode } from './useDebugMode';
import { useDOMScan } from './useDOMScan';
import { useNavigationTiming } from './useNavigationTiming';

interface BootSequenceProps {
  elapsed: number;
  progress: number;
  mouseInfluence: MouseInfluence;
  visible: boolean;
  onDebugPausedChange?: (isPaused: boolean) => void;
  onBootComplete?: (isComplete: boolean) => void;
}

// Default connection info for initial render
const DEFAULT_CONNECTION: ConnectionInfo = {
  serverIp: '...',
  tlsVersion: 'TLSv1.3',
  tlsCipher: 'TLS_AES_128_GCM_SHA256',
  certIssuer: "Let's Encrypt",
  certCN: 'eve0415.net',
  certValidFrom: '...',
  certValidTo: '...',
  certChain: ["Let's Encrypt R3", 'ISRG Root X1'],
  httpVersion: 'h2',
  cfRay: null,
  colo: null,
};

const BootSequence: FC<BootSequenceProps> = ({ elapsed, visible, mouseInfluence, onDebugPausedChange, onBootComplete }) => {
  // Get real browser data
  const timing = useNavigationTiming();
  const dom = useDOMScan();

  // Scroll container ref for auto-scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Ref to track current visible message count for debug mode sync
  const visibleCountRef = useRef(0);

  // Fetch server-side connection info
  const [connection, setConnection] = useState<ConnectionInfo>(DEFAULT_CONNECTION);
  useEffect(() => {
    if (!visible) return;
    getConnectionInfo().then(setConnection).catch(console.error);
  }, [visible]);

  // Current path
  const currentPath = useMemo(() => {
    if (typeof window === 'undefined') return '/unknown';
    return window.location.pathname;
  }, []);

  // We need to get allMessages first to pass depths to useDebugMode
  // Use a preliminary calculation with default debug state
  const preliminaryAnimation = useBootAnimation({
    enabled: visible,
    elapsed,
    timing,
    dom,
    connection,
    path: currentPath,
    isDebugMode: false,
    isPaused: false,
    debugIndex: 0,
    maxVisibleDepth: Infinity,
  });

  // Debug mode with message info for keyboard navigation
  const { debugState, stepContinue, pause, stepOver, stepInto, stepOut, stepBack, stopDebug } = useDebugMode(
    preliminaryAnimation.messageDepths,
    preliminaryAnimation.allMessages.length,
    visibleCountRef,
  );

  // Boot animation with debug state
  const { visibleMessages, allMessages, currentProgress, overallProgress, cursorVisible, allMessagesDisplayed } = useBootAnimation({
    enabled: visible,
    elapsed,
    timing,
    dom,
    connection,
    path: currentPath,
    isDebugMode: debugState.isEnabled,
    isPaused: debugState.isPaused,
    debugIndex: debugState.debugIndex,
    maxVisibleDepth: debugState.maxVisibleDepth,
  });

  // Auto-scroll: hybrid mode uses instant for multiple messages, smooth for single
  const { handleScroll } = useAutoScroll({
    containerRef: scrollContainerRef,
    dependency: visibleMessages.length,
    smooth: 'auto',
  });

  // Sync visible count ref for debug pause functionality
  useEffect(() => {
    visibleCountRef.current = visibleMessages.length;
  }, [visibleMessages.length]);

  // Notify parent when debug paused state changes
  useEffect(() => {
    onDebugPausedChange?.(debugState.isPaused && debugState.isEnabled);
  }, [debugState.isPaused, debugState.isEnabled, onDebugPausedChange]);

  // Notify parent when boot sequence completes
  useEffect(() => {
    onBootComplete?.(allMessagesDisplayed);
  }, [allMessagesDisplayed, onBootComplete]);

  if (!visible) return null;

  // Calculate subtle glow position based on mouse
  const glowStyle = {
    background: `radial-gradient(circle at ${mouseInfluence.position.x}px ${mouseInfluence.position.y}px, rgba(0, 212, 255, ${mouseInfluence.glowIntensity * 0.1}) 0%, transparent 300px)`,
  };

  // Get status label based on progress
  const getStatusLabel = () => {
    if (overallProgress > 90) return 'HYDRATION_ERROR';
    if (overallProgress > 80) return 'EXECUTING';
    if (overallProgress > 60) return 'RENDERING';
    if (overallProgress > 40) return 'PARSING';
    return 'CONNECTING';
  };

  const getStatusColor = () => {
    if (overallProgress > 90) return 'text-red-400';
    if (overallProgress > 80) return 'text-orange';
    return 'text-neon';
  };

  // Handlers that pass required data
  const handleStepOver = () => stepOver(preliminaryAnimation.messageDepths);
  const handleStepInto = () => stepInto(allMessages.length);
  const handleStepOut = () => stepOut(preliminaryAnimation.messageDepths);
  const handleStepBack = () => stepBack();

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-background' style={glowStyle}>
      {/* Debug toolbar */}
      {debugState.isEnabled && (
        <DebugToolbar
          isPaused={debugState.isPaused}
          currentIndex={debugState.debugIndex}
          totalMessages={allMessages.length}
          onContinue={stepContinue}
          onPause={pause}
          onStepOver={handleStepOver}
          onStepInto={handleStepInto}
          onStepOut={handleStepOut}
          onStepBack={handleStepBack}
          onStop={stopDebug}
        />
      )}

      <div className='w-full max-w-2xl px-6'>
        {/* Terminal window */}
        <div className='rounded-lg border border-line/50 bg-surface/90 shadow-2xl backdrop-blur-sm'>
          {/* Window header */}
          <div className='flex items-center gap-2 border-line/30 border-b px-4 py-2'>
            <div className='size-3 rounded-full bg-red-500/80' />
            <div className='size-3 rounded-full bg-yellow-500/80' />
            <div className='size-3 rounded-full bg-green-500/80' />
            <span className='ml-4 text-muted-foreground text-xs'>browser://network-inspector</span>
            {debugState.isEnabled && <span className='ml-auto rounded bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-400'>DEBUG</span>}
          </div>

          {/* Terminal content */}
          <div ref={scrollContainerRef} onScroll={handleScroll} className='max-h-[60vh] space-y-0.5 overflow-y-auto p-4 font-mono text-xs'>
            {/* Boot messages */}
            {visibleMessages.map((msg, i) => {
              const isCurrentLine = debugState.isEnabled && i === visibleMessages.length - 1;
              const indent = msg.depth * 16; // 1rem per depth level

              return (
                <div
                  key={msg.id}
                  className={`flex items-start transition-all duration-150 ${isCurrentLine && debugState.isPaused ? 'rounded bg-amber-500/10' : ''}`}
                  style={{ paddingLeft: `${indent}px` }}
                >
                  {/* Breakpoint indicator */}
                  {debugState.isEnabled && (
                    <span className='mr-2 w-3 shrink-0'>
                      {isCurrentLine && debugState.isPaused && <span className='inline-block size-2 rounded-full bg-amber-500' />}
                    </span>
                  )}

                  {/* Hierarchy indicator */}
                  {msg.depth > 0 && <span className='mr-1.5 text-line/50'>{msg.type === 'group' ? '▼' : '├'}</span>}

                  {/* Message text */}
                  <span
                    className={
                      msg.type === 'error'
                        ? 'text-red-400'
                        : msg.type === 'warning'
                          ? 'text-orange'
                          : msg.type === 'success'
                            ? 'text-neon'
                            : msg.type === 'group'
                              ? 'font-medium text-cyan'
                              : 'text-foreground/80'
                    }
                  >
                    {msg.resolvedText}
                  </span>
                </div>
              );
            })}

            {/* Cursor line */}
            {!debugState.isPaused && (
              <div className='flex items-center gap-1 text-foreground/60'>
                <span>{'>'}</span>
                <span className={`h-4 w-2 bg-cyan ${cursorVisible ? 'opacity-100' : 'opacity-0'}`} />
              </div>
            )}
          </div>

          {/* Progress bar */}
          {currentProgress.stage && (
            <div className='border-line/30 border-t px-4 py-3'>
              <div className='mb-1 flex justify-between text-muted-foreground text-xs'>
                <span>{currentProgress.stage.label}</span>
                <span className='tabular-nums'>{Math.round(currentProgress.progress * 100)}%</span>
              </div>
              <div className='h-1.5 overflow-hidden rounded-full bg-line/30'>
                <div className='h-full rounded-full bg-linear-to-r from-cyan to-neon' style={{ width: `${currentProgress.progress * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Status line below terminal */}
        <div className='mt-4 text-center text-muted-foreground text-xs'>
          <span>STATUS: </span>
          <span className={getStatusColor()}>{getStatusLabel()}</span>
          {debugState.isEnabled && debugState.isPaused && <span className='ml-2 text-amber-500'>(PAUSED)</span>}
        </div>

        {/* Debug hint */}
        {!debugState.isEnabled && <div className='mt-2 text-center text-[10px] text-subtle-foreground'>Press F5 to enter debug mode</div>}
      </div>
    </div>
  );
};

export default BootSequence;
