import type { FC } from 'react';

import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

// Format seconds as MM:SS
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Go context timeout visualization with hourglass
const TimeoutError: FC = () => {
  const reducedMotion = useReducedMotion();

  const [timeRemaining, setTimeRemaining] = useState(() => (reducedMotion ? 0 : 30));
  const [requestProgress, setRequestProgress] = useState(() => (reducedMotion ? 65 : 0));
  const [timedOut, setTimedOut] = useState(() => reducedMotion);
  const [sandFalling, setSandFalling] = useState(true);

  const timeRef = useRef(30);
  const progressRef = useRef(0);

  // Countdown timer
  useEffect(() => {
    if (reducedMotion) return;

    timeRef.current = 30;
    const interval = setInterval(() => {
      if (timeRef.current > 0) {
        timeRef.current -= 1;
        setTimeRemaining(timeRef.current);

        // Request makes slow progress
        if (progressRef.current < 65) {
          progressRef.current += 2 + Math.random() * 2;
          setRequestProgress(Math.min(progressRef.current, 65));
        }

        if (timeRef.current === 0) {
          setTimedOut(true);
          setSandFalling(false);
        }
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [reducedMotion]);

  return (
    <div className='bg-background fixed inset-0 overflow-x-hidden overflow-y-auto'>
      {/* Go terminal header */}
      <div className='bg-background flex h-9 items-center border-b border-[#00add8]/30 px-4'>
        <span className='font-mono text-xs text-[#00add8]'>go run server.go - context deadline exceeded</span>
      </div>

      <div className='bg-background flex h-[calc(100%-2.25rem)] flex-col md:flex-row'>
        {/* Main visualization */}
        <div className='relative h-1/2 flex-1 p-4 md:h-auto md:p-8'>
          {/* Hourglass visualization */}
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
            <svg width='200' height='300' viewBox='0 0 200 300'>
              {/* Hourglass frame */}
              <path d='M40,20 L160,20 L160,40 L120,140 L160,240 L160,280 L40,280 L40,240 L80,140 L40,40 Z' fill='none' stroke='#00add8' strokeWidth='3' />

              {/* Top sand */}
              <clipPath id='topSand'>
                <path d='M45,25 L155,25 L155,35 L115,135 L85,135 L45,35 Z' />
              </clipPath>
              <rect
                x='40'
                y='20'
                width='120'
                height={120 * (timeRemaining / 30)}
                fill='#00add8'
                opacity='0.6'
                clipPath='url(#topSand)'
                style={{ transform: `translateY(${120 * (1 - timeRemaining / 30)}px)` }}
              />

              {/* Bottom sand */}
              <clipPath id='bottomSand'>
                <path d='M85,145 L115,145 L155,245 L155,275 L45,275 L45,245 Z' />
              </clipPath>
              <rect
                x='40'
                y={280 - 130 * (1 - timeRemaining / 30)}
                width='120'
                height={130 * (1 - timeRemaining / 30)}
                fill='#00add8'
                opacity='0.6'
                clipPath='url(#bottomSand)'
              />

              {/* Falling sand particles */}
              {sandFalling && (
                <>
                  <circle cx='100' cy='145' r='2' fill='#00add8'>
                    <animate attributeName='cy' values='145;155' dur='0.3s' repeatCount='indefinite' />
                    <animate attributeName='opacity' values='1;0' dur='0.3s' repeatCount='indefinite' />
                  </circle>
                  <circle cx='98' cy='148' r='1.5' fill='#00add8'>
                    <animate attributeName='cy' values='148;158' dur='0.25s' repeatCount='indefinite' />
                    <animate attributeName='opacity' values='1;0' dur='0.25s' repeatCount='indefinite' />
                  </circle>
                </>
              )}

              {/* X mark when timed out */}
              {timedOut && (
                <g stroke='#ff4444' strokeWidth='4'>
                  <line x1='70' y1='120' x2='130' y2='180'>
                    <animate attributeName='opacity' values='0;1' dur='0.3s' fill='freeze' />
                  </line>
                  <line x1='130' y1='120' x2='70' y2='180'>
                    <animate attributeName='opacity' values='0;1' dur='0.3s' fill='freeze' />
                  </line>
                </g>
              )}
            </svg>

            {/* Timer display */}
            <div className='mt-4 text-center'>
              <div className={`font-mono text-4xl ${timedOut ? 'text-[#ff4444]' : 'text-[#00add8]'}`}>{timedOut ? 'TIMEOUT' : formatTime(timeRemaining)}</div>
              <div className='mt-2 font-mono text-xs text-[#666]'>context.WithTimeout(30s)</div>
            </div>
          </div>

          {/* Request progress */}
          <div className='absolute right-8 bottom-24 left-8'>
            <div className='mb-2 flex justify-between font-mono text-xs'>
              <span className='text-[#00add8]'>Request Progress</span>
              <span className={timedOut ? 'text-[#ff4444]' : 'text-[#888]'}>{requestProgress.toFixed(0)}%</span>
            </div>
            <div className='bg-muted h-3 overflow-hidden rounded'>
              <div className={`h-full transition-all duration-200 ${timedOut ? 'bg-[#ff4444]' : 'bg-[#00add8]'}`} style={{ width: `${requestProgress}%` }} />
            </div>
            {timedOut && <div className='mt-2 font-mono text-xs text-[#ff4444]'>Request cancelled - deadline exceeded</div>}
          </div>
        </div>

        {/* Log panel */}
        <div className='bg-background h-1/2 w-full overflow-y-auto border-t border-[#333] p-4 md:h-auto md:w-96 md:border-t-0 md:border-l'>
          <div className='mb-4 font-mono text-xs text-[#00add8]'>Request Log</div>

          <div className='space-y-2 font-mono text-[10px]'>
            <div className='text-[#888]'>[00:00.000] Starting request to /page</div>
            <div className='text-[#888]'>[00:00.100] DNS lookup...</div>
            <div className='text-[#888]'>[00:00.500] Connecting to server...</div>
            <div className='text-[#888]'>[00:01.200] TLS handshake...</div>
            <div className='text-[#888]'>[00:02.000] Sending request...</div>
            <div className='text-[#888]'>[00:02.500] Waiting for response...</div>
            {requestProgress > 30 && <div className='text-[#888]'>[00:15.000] Receiving data... 30%</div>}
            {requestProgress > 50 && <div className='text-[#888]'>[00:25.000] Receiving data... 50%</div>}
            {timedOut && (
              <>
                <div className='text-[#ff4444]'>[00:30.000] context deadline exceeded</div>
                <div className='text-[#ff4444]'>[00:30.001] Request cancelled</div>
              </>
            )}
          </div>

          {timedOut && (
            <div className='mt-6 rounded border border-[#ff4444]/50 bg-[#ff4444]/10 p-3'>
              <div className='font-mono text-xs text-[#ff4444]'>error: context deadline exceeded</div>
              <div className='mt-2 font-mono text-[10px] text-[#888]'>
                ctx, cancel := context.WithTimeout(
                <br />
                {'    '}context.Background(),
                <br />
                {'    '}30*time.Second,
                <br />)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className='absolute inset-x-0 bottom-8 text-center'>
        <Link
          to='/'
          className='inline-flex items-center gap-2 rounded bg-[#00add8]/20 px-6 py-3 font-mono text-sm text-[#00add8] transition-all hover:bg-[#00add8]/30'
        >
          タイムアウト延長 → ホームへ戻る
        </Link>
      </div>
    </div>
  );
};

export default TimeoutError;
