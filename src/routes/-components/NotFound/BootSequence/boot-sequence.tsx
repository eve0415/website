import type { MouseInfluence } from '../useMouseInfluence';
import type { FC } from 'react';

import { useMemo } from 'react';

import { useBootAnimation } from './useBootAnimation';

interface BootSequenceProps {
  elapsed: number;
  progress: number;
  mouseInfluence: MouseInfluence;
  visible: boolean;
}

const BootSequence: FC<BootSequenceProps> = ({ elapsed, visible, mouseInfluence }) => {
  const { visibleMessages, currentProgress, cursorVisible } = useBootAnimation({
    enabled: visible,
    elapsed,
  });

  // Get current path for display
  const currentPath = useMemo(() => {
    if (typeof window === 'undefined') return '/unknown';
    return window.location.pathname;
  }, []);

  // Replace [path] placeholder in messages with actual path
  const displayMessages = useMemo(
    () =>
      visibleMessages.map(msg => ({
        ...msg,
        text: msg.text.replace('[path]', currentPath),
      })),
    [visibleMessages, currentPath],
  );

  if (!visible) return null;

  // Calculate subtle glow position based on mouse
  const glowStyle = {
    background: `radial-gradient(circle at ${mouseInfluence.position.x}px ${mouseInfluence.position.y}px, rgba(0, 212, 255, ${mouseInfluence.glowIntensity * 0.1}) 0%, transparent 300px)`,
  };

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-background' style={glowStyle}>
      <div className='w-full max-w-2xl px-6'>
        {/* Terminal window */}
        <div className='rounded-lg border border-line/50 bg-surface/90 shadow-2xl backdrop-blur-sm'>
          {/* Window header */}
          <div className='flex items-center gap-2 border-line/30 border-b px-4 py-2'>
            <div className='size-3 rounded-full bg-red-500/80' />
            <div className='size-3 rounded-full bg-yellow-500/80' />
            <div className='size-3 rounded-full bg-green-500/80' />
            <span className='ml-4 text-muted-foreground text-xs'>browser://network-inspector</span>
          </div>

          {/* Terminal content */}
          <div className='space-y-1 p-4 font-mono text-sm'>
            {/* Boot messages */}
            {displayMessages.map((msg, i) => (
              <div
                key={i}
                className={`transition-opacity duration-150 ${
                  msg.type === 'error' ? 'text-red-400' : msg.type === 'warning' ? 'text-orange' : msg.type === 'success' ? 'text-neon' : 'text-foreground/80'
                }`}
              >
                {msg.text}
              </div>
            ))}

            {/* Cursor line */}
            <div className='flex items-center gap-1 text-foreground/60'>
              <span>{'>'}</span>
              <span className={`h-4 w-2 bg-cyan ${cursorVisible ? 'opacity-100' : 'opacity-0'}`} />
            </div>
          </div>

          {/* Progress bar */}
          {currentProgress.stage && (
            <div className='border-line/30 border-t px-4 py-3'>
              <div className='mb-1 flex justify-between text-muted-foreground text-xs'>
                <span>{currentProgress.stage.label}</span>
                <span>{Math.round(currentProgress.progress * 100)}%</span>
              </div>
              <div className='h-1.5 overflow-hidden rounded-full bg-line/30'>
                <div
                  className='h-full rounded-full bg-linear-to-r from-cyan to-neon transition-all duration-100'
                  style={{ width: `${currentProgress.progress * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Status line below terminal */}
        <div className='mt-4 text-center text-muted-foreground text-xs'>
          <span className='opacity-60'>STATUS: </span>
          <span className={elapsed > 6000 ? 'text-red-400' : elapsed > 4400 ? 'text-orange' : 'text-neon'}>
            {elapsed > 6400 ? 'HYDRATION_ERROR' : elapsed > 5500 ? 'EXECUTING' : elapsed > 4400 ? 'RENDERING' : elapsed > 2200 ? 'PARSING' : 'CONNECTING'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BootSequence;
