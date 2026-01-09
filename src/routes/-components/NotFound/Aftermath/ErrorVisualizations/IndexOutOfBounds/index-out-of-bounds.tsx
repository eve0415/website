import type { FC } from 'react';

import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

// Clean grid UI visualization for IndexOutOfBoundsException
const IndexOutOfBounds: FC = () => {
  const [cursorPosition, setCursorPosition] = useState(-1);
  const [showError, setShowError] = useState(false);

  const arraySize = 10;
  const targetIndex = 404;

  // Use ref to avoid React Compiler issues with captured variables
  const positionRef = useRef(-1);

  // Animate cursor moving through array then past boundary
  useEffect(() => {
    positionRef.current = -1;
    const interval = setInterval(() => {
      positionRef.current += 1;
      setCursorPosition(positionRef.current);

      if (positionRef.current >= arraySize) {
        setTimeout(() => setShowError(true), 300);
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='fixed inset-0 overflow-hidden bg-[#fafafa]'>
      {/* Subtle grid background */}
      <div
        className='pointer-events-none absolute inset-0 opacity-40'
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className='flex h-full flex-col items-center justify-center p-6'>
        {/* Title */}
        <div className='mb-12 text-center'>
          <div className='font-mono text-[#666] text-xs tracking-wider'>ARRAY BOUNDS ERROR</div>
          <div className='mt-2 font-semibold text-3xl text-muted'>IndexOutOfBoundsException</div>
        </div>

        {/* Array visualization */}
        <div className='mb-8'>
          <div className='mb-4 font-mono text-[#999] text-xs'>int[] data = new int[{arraySize}];</div>

          {/* Array grid */}
          <div className='flex gap-1'>
            {Array.from({ length: arraySize }).map((_, i) => (
              <div
                key={i}
                className={`relative flex size-14 flex-col items-center justify-center rounded-lg border-2 font-mono transition-all duration-200 sm:size-16 ${
                  cursorPosition === i
                    ? 'border-[#3b82f6] bg-[#3b82f6]/10 ring-2 ring-[#3b82f6]/30'
                    : cursorPosition > i
                      ? 'border-[#22c55e]/50 bg-[#22c55e]/5'
                      : 'border-foreground bg-white'
                }`}
              >
                <span className='text-[#666] text-xs sm:text-sm'>{i * 10}</span>
                <span className='text-[#999] text-[10px] sm:text-xs'>[{i}]</span>
              </div>
            ))}

            {/* Out of bounds indicator */}
            <div className='flex items-center px-2'>
              <span className='text-[#999] text-lg'>→</span>
            </div>

            {/* Invalid access cell */}
            <div
              className={`relative flex size-14 flex-col items-center justify-center rounded-lg border-2 border-dashed font-mono transition-all duration-200 sm:size-16 ${
                cursorPosition >= arraySize ? 'animate-pulse border-[#ef4444] bg-[#ef4444]/10' : 'border-foreground bg-[#f5f5f5]'
              }`}
            >
              <span className={`text-xs sm:text-sm ${cursorPosition >= arraySize ? 'text-[#ef4444]' : 'text-[#ccc]'}`}>???</span>
              <span className='text-[#999] text-[10px] sm:text-xs'>[{targetIndex}]</span>

              {cursorPosition >= arraySize && (
                <div className='absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-[#ef4444] text-white text-xs'>!</div>
              )}
            </div>
          </div>

          {/* Index indicator */}
          <div className='relative mt-4 h-2'>
            <div className='absolute inset-x-0 h-0.5 bg-foreground' />
            {cursorPosition >= 0 && (
              <div
                className={`absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 ${
                  cursorPosition >= arraySize ? 'bg-[#ef4444]' : 'bg-[#3b82f6]'
                }`}
                style={{
                  left: `${Math.min(cursorPosition, arraySize) * (100 / (arraySize + 1)) + 100 / (arraySize + 1) / 2}%`,
                }}
              />
            )}
          </div>
        </div>

        {/* Error message */}
        {showError && (
          <div className='mb-8 w-full max-w-lg animate-[fadeIn_0.3s_ease-out] rounded-lg border border-[#fecaca] bg-[#fef2f2] p-4'>
            <div className='flex items-start gap-3'>
              <div className='flex size-6 shrink-0 items-center justify-center rounded-full bg-[#ef4444] text-white text-xs'>!</div>
              <div>
                <div className='font-semibold text-[#991b1b] text-sm'>java.lang.IndexOutOfBoundsException</div>
                <div className='mt-1 font-mono text-[#dc2626] text-xs'>
                  Index {targetIndex} out of bounds for length {arraySize}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Code snippet */}
        <div className='mb-8 w-full max-w-lg rounded-lg border border-foreground bg-[#f9f9f9] p-4'>
          <div className='font-mono text-xs'>
            <div className='text-[#999]'>// Line 404</div>
            <div>
              <span className='text-[#0070f3]'>int</span> value = data[
              <span className='text-[#ef4444]'>{targetIndex}</span>]; <span className='text-[#ef4444]'>// ← Exception here</span>
            </div>
          </div>
        </div>

        {/* Fix action */}
        <Link to='/' className='inline-flex items-center gap-2 rounded-lg bg-muted px-6 py-3 font-mono text-sm text-white transition-all hover:bg-[#333]'>
          <span className='text-[#22c55e]'>✓</span>
          境界を修正 → ホームへ戻る
        </Link>
      </div>
    </div>
  );
};

export default IndexOutOfBounds;
