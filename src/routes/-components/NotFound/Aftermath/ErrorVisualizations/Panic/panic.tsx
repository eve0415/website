import type { FC } from 'react';

import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

// Go/Rust panic visualization with stack unwinding
const Panic: FC = () => {
  const reducedMotion = useReducedMotion();

  const stackFrames = [
    { func: 'main.handleRequest', file: 'server.go:42', status: 'unwinding' },
    { func: 'main.processPage', file: 'page.go:156', status: 'unwinding' },
    { func: 'main.fetchData', file: 'data.go:89', status: 'unwinding' },
    { func: 'main.parseResponse', file: 'parse.go:234', status: 'unwinding' },
    { func: 'main.validatePtr', file: 'validate.go:12', status: 'panic' },
  ];

  const [unwindIndex, setUnwindIndex] = useState(() => (reducedMotion ? stackFrames.length : 0));
  const [panicShown, setPanicShown] = useState(() => reducedMotion);
  const [recoverAttempt, setRecoverAttempt] = useState(false);
  const [recoverFailed, setRecoverFailed] = useState(() => reducedMotion);

  const unwindIndexRef = useRef(0);

  // Animate stack unwinding
  useEffect(() => {
    if (reducedMotion) return;

    unwindIndexRef.current = 0;

    // Show panic first
    setTimeout(() => {
      setPanicShown(true);

      // Then unwind stack
      const interval = setInterval(() => {
        if (unwindIndexRef.current < stackFrames.length) {
          unwindIndexRef.current += 1;
          setUnwindIndex(unwindIndexRef.current);
        } else {
          clearInterval(interval);
          // Attempt recover
          setTimeout(() => {
            setRecoverAttempt(true);
            setTimeout(() => setRecoverFailed(true), 800);
          }, 500);
        }
      }, 300);

      return () => clearInterval(interval);
    }, 500);
  }, [reducedMotion, stackFrames.length]);

  return (
    <div className='bg-background fixed inset-0 overflow-hidden'>
      {/* Terminal style header */}
      <div className='bg-background flex h-9 items-center border-b border-[#00d4aa]/30 px-4'>
        <span className='font-mono text-xs text-[#00d4aa]'>go run page.go</span>
      </div>

      <div className='bg-background flex h-[calc(100%-2.25rem)] p-8'>
        <div className='mx-auto max-w-3xl'>
          {/* Panic message */}
          {panicShown && (
            <div className='mb-8 rounded border border-[#ff4444]/50 bg-[#ff4444]/10 p-4'>
              <div className='font-mono text-sm text-[#ff4444]'>panic: runtime error: invalid memory address or nil pointer dereference</div>
              <div className='mt-2 font-mono text-xs text-[#888]'>[signal SIGSEGV: segmentation violation code=0x1 addr=0x0 pc=0x4a404]</div>
            </div>
          )}

          {/* Goroutine info */}
          {panicShown && <div className='mb-6 font-mono text-xs text-[#00d4aa]/70'>goroutine 1 [running]:</div>}

          {/* Stack trace with unwinding animation */}
          <div className='space-y-2'>
            {stackFrames.slice(0, unwindIndex).map((frame, i) => {
              const isUnwinding = i < unwindIndex - 1;
              const isPanicSource = frame.status === 'panic';

              return (
                <div
                  key={i}
                  className={`rounded border p-3 font-mono text-xs transition-all duration-300 ${
                    isPanicSource
                      ? 'border-[#ff4444] bg-[#ff4444]/20'
                      : isUnwinding
                        ? 'border-[#ffaa00]/50 bg-[#ffaa00]/10 opacity-50'
                        : 'border-[#333] bg-[#111]'
                  }`}
                  style={{
                    transform: isUnwinding ? `translateX(${(unwindIndex - i) * 10}px)` : 'none',
                  }}
                >
                  <div className='flex items-center gap-4'>
                    <span className={isPanicSource ? 'text-[#ff4444]' : isUnwinding ? 'text-[#ffaa00]' : 'text-[#00d4aa]'}>
                      {isPanicSource ? 'PANIC' : isUnwinding ? 'UNWINDING' : 'FRAME'}
                    </span>
                    <span className='text-white'>{frame.func}(...)</span>
                  </div>
                  <div className='mt-1 pl-20 text-[#666]'>{frame.file}</div>
                </div>
              );
            })}
          </div>

          {/* Recover attempt */}
          {recoverAttempt && (
            <div className='mt-8 rounded border border-[#00d4aa]/30 bg-[#00d4aa]/5 p-4'>
              <div className='flex items-center gap-3 font-mono text-sm'>
                <span className='text-[#00d4aa]'>recover()</span>
                <span className='text-[#666]'>attempting to recover...</span>
                {recoverFailed && <span className='ml-auto text-[#ff4444]'>&#x2717; defer not found - unrecoverable</span>}
              </div>
            </div>
          )}

          {/* Exit status */}
          {recoverFailed && (
            <div className='mt-6 font-mono text-xs'>
              <div className='text-[#ff4444]'>exit status 2</div>
              <div className='mt-2 text-[#666]'>Process exited with code 2</div>
            </div>
          )}

          {/* Gopher panic visualization */}
          {panicShown && (
            <div className='absolute top-1/2 right-12 -translate-y-1/2 text-center'>
              <div
                className='text-8xl'
                style={{
                  animation: reducedMotion ? 'none' : 'pulse 0.5s infinite',
                }}
              >
                &#x1F630;
              </div>
              <div className='mt-2 font-mono text-xs text-[#00d4aa]/50'>gopher.panic()</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className='absolute inset-x-0 bottom-8 text-center'>
        <Link
          to='/'
          className='inline-flex items-center gap-2 rounded bg-[#00d4aa]/20 px-6 py-3 font-mono text-sm text-[#00d4aa] transition-all hover:bg-[#00d4aa]/30'
        >
          recover() → ホームへ戻る
        </Link>
      </div>
    </div>
  );
};

export default Panic;
