import type { FC } from 'react';

import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

// Retro terminal (green phosphor CRT) visualization for StackOverflowError
const StackOverflow: FC = () => {
  const [stackFrames, setStackFrames] = useState<string[]>([]);
  const [overflowing, setOverflowing] = useState(false);
  const [crashed, setCrashed] = useState(false);

  // Use ref to avoid React Compiler issues with captured variables
  const currentIndexRef = useRef(0);

  // Animate stack frames piling up
  useEffect(() => {
    const frames = [
      'recurse(n=404)',
      'recurse(n=403)',
      'recurse(n=402)',
      'recurse(n=401)',
      'recurse(n=400)',
      'recurse(n=399)',
      'recurse(n=398)',
      'recurse(n=397)',
      '... 389 more frames ...',
      'recurse(n=8)',
      'recurse(n=7)',
      'recurse(n=6)',
      'recurse(n=5)',
      'recurse(n=4)',
      'recurse(n=3)',
      'recurse(n=2)',
      'recurse(n=1)',
      'main()',
    ];

    currentIndexRef.current = 0;
    const interval = setInterval(() => {
      if (currentIndexRef.current < frames.length) {
        setStackFrames(prev => [frames[currentIndexRef.current]!, ...prev]);
        currentIndexRef.current += 1;
      } else {
        clearInterval(interval);
        setOverflowing(true);
        setTimeout(() => setCrashed(true), 800);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='fixed inset-0 overflow-hidden bg-background'>
      {/* CRT scan line effect */}
      <div
        className='pointer-events-none absolute inset-0 opacity-10'
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 0, 0.03) 2px,
            rgba(0, 255, 0, 0.03) 4px
          )`,
        }}
      />

      {/* Phosphor glow effect */}
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0, 255, 0, 0.05) 0%, transparent 70%)',
        }}
      />

      {/* Screen curvature vignette */}
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          boxShadow: 'inset 0 0 150px 60px rgba(0, 0, 0, 0.8)',
        }}
      />

      <div className='relative flex h-full flex-col p-6 font-mono'>
        {/* Terminal header */}
        <div className='mb-4 flex items-center gap-4'>
          <span className='text-[#00ff00] text-xs'>STACK MONITOR v1.0</span>
          <span className='text-[#00ff00]/50 text-xs'>|</span>
          <span className={`text-xs ${crashed ? 'animate-pulse text-[#ff0000]' : 'text-[#00ff00]/70'}`}>
            {crashed ? '███ OVERFLOW DETECTED ███' : 'MONITORING...'}
          </span>
        </div>

        {/* Stack visualization */}
        <div className='relative flex-1 overflow-hidden rounded border border-[#00ff00]/30 bg-[#001100]'>
          {/* Stack frames scrolling area */}
          <div className='absolute inset-0 flex flex-col-reverse overflow-hidden p-4'>
            {/* Bottom marker */}
            <div className='mb-2 border-[#00ff00]/30 border-t pt-2 text-center text-[#00ff00]/50 text-[10px]'>─── STACK BOTTOM ───</div>

            {/* Stack frames */}
            <div className='space-y-1'>
              {stackFrames.map((frame, i) => (
                <div
                  key={`${frame}-${i}`}
                  className={`border-l-2 py-1 pl-3 text-xs transition-all duration-200 ${
                    i === 0 && !crashed
                      ? 'border-[#00ff00] text-[#00ff00]'
                      : crashed && i < 3
                        ? 'animate-pulse border-[#ff0000] text-[#ff0000]'
                        : 'border-[#00ff00]/30 text-[#00ff00]/60'
                  }`}
                  style={{
                    textShadow: i === 0 ? '0 0 8px rgba(0, 255, 0, 0.5)' : 'none',
                  }}
                >
                  <span className='text-[#00ff00]/40'>{String(i).padStart(4, '0')}</span>
                  <span className='mx-2'>│</span>
                  {frame}
                </div>
              ))}
            </div>
          </div>

          {/* Overflow warning overlay */}
          {overflowing && (
            <div className='absolute inset-0 flex items-center justify-center bg-[#ff0000]/10'>
              <div className='text-center'>
                <div className='font-bold text-4xl text-[#ff0000] sm:text-6xl' style={{ textShadow: '0 0 20px rgba(255, 0, 0, 0.8)' }}>
                  STACK OVERFLOW
                </div>
                <div className='mt-4 animate-pulse text-[#ff0000]/80 text-sm'>Maximum call stack size exceeded</div>
              </div>
            </div>
          )}
        </div>

        {/* Memory meter */}
        <div className='mt-4 space-y-2'>
          <div className='flex justify-between text-[#00ff00]/70 text-[10px]'>
            <span>STACK MEMORY</span>
            <span className={crashed ? 'text-[#ff0000]' : ''}>{crashed ? '100%' : `${Math.min(stackFrames.length * 5.5, 99).toFixed(0)}%`}</span>
          </div>
          <div className='h-2 overflow-hidden rounded bg-[#001100] ring-1 ring-[#00ff00]/30'>
            <div
              className={`h-full transition-all duration-200 ${crashed ? 'bg-[#ff0000]' : 'bg-[#00ff00]'}`}
              style={{ width: crashed ? '100%' : `${Math.min(stackFrames.length * 5.5, 99)}%` }}
            />
          </div>
        </div>

        {/* Terminal input area */}
        <div className='mt-4 rounded border border-[#00ff00]/30 bg-[#001100] p-3'>
          <div className='flex items-center gap-2 text-[#00ff00] text-xs'>
            <span className='animate-pulse'>▌</span>
            <Link to='/' className='transition-opacity hover:opacity-80' style={{ textShadow: '0 0 8px rgba(0, 255, 0, 0.5)' }}>
              &gt; スタックをクリア &amp;&amp; ホームへ戻る_
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StackOverflow;
