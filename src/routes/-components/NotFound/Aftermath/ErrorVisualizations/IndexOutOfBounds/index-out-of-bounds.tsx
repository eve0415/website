import type { FC } from 'react';

import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

// Hex values for array corruption effect (outside component to avoid re-creation)
const CORRUPTION_VALUES = ['0xDEAD', '0xBEEF', '0xCAFE', '0xBABE', '0xFACE', '???', '0x????'] as const;

// Memory debugger themed visualization for IndexOutOfBoundsException
const IndexOutOfBounds: FC = () => {
  const reducedMotion = useReducedMotion();

  const arraySize = 10;
  const targetIndex = 404;

  const [cursorPosition, setCursorPosition] = useState(() => (reducedMotion ? arraySize : -1));
  const [showError, setShowError] = useState(() => reducedMotion);
  const [corruptedText, setCorruptedText] = useState('0xDEAD');

  // Use ref to avoid React Compiler issues with captured variables
  const positionRef = useRef(-1);

  // Convert index to hex value (simulating memory contents)
  const toHexValue = (index: number) => `0x${(index * 10).toString(16).toUpperCase().padStart(2, '0')}`;

  // Animate cursor moving through array then past boundary
  useEffect(() => {
    if (reducedMotion) return;

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
  }, [reducedMotion]);

  // Corruption text cycling effect for error cell (skip when reduced motion)
  useEffect(() => {
    if (reducedMotion) return;
    if (cursorPosition < arraySize) return;

    const corruptionInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * CORRUPTION_VALUES.length);
      setCorruptedText(CORRUPTION_VALUES[randomIndex] ?? '???');
    }, 150);

    return () => clearInterval(corruptionInterval);
  }, [cursorPosition, reducedMotion]);

  return (
    <div className='fixed inset-0 overflow-hidden bg-background'>
      {/* Memory address grid background */}
      <div
        className='pointer-events-none absolute inset-0 opacity-[0.04]'
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 39px,
              rgba(0, 255, 136, 0.3) 39px,
              rgba(0, 255, 136, 0.3) 40px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 79px,
              rgba(0, 255, 136, 0.3) 79px,
              rgba(0, 255, 136, 0.3) 80px
            )
          `,
        }}
      />

      {/* Faint hex address overlay */}
      <div className='pointer-events-none absolute inset-0 flex flex-wrap gap-20 overflow-hidden p-4 font-mono text-[8px] text-neon/6'>
        {Array.from({ length: 50 }).map((_, i) => (
          <span key={i}>0x{(i * 0x100).toString(16).toUpperCase().padStart(4, '0')}</span>
        ))}
      </div>

      <div className='flex h-full flex-col items-center justify-center p-6'>
        {/* Title */}
        <div className='mb-12 text-center'>
          <div className='font-mono text-neon text-xs tracking-wider'>[ARRAY_BOUNDS_ERROR]</div>
          <div className='mt-2 font-semibold text-3xl text-red-400'>IndexOutOfBoundsException</div>
        </div>

        {/* Array visualization */}
        <div className='mb-8'>
          <div className='mb-4 font-mono text-muted-foreground text-xs'>
            <span className='text-cyan'>int</span>[] data = <span className='text-cyan'>new</span> <span className='text-cyan'>int</span>[{arraySize}];
          </div>

          {/* Array grid */}
          <div className='flex gap-1'>
            {Array.from({ length: arraySize }).map((_, i) => (
              <div
                key={i}
                className={`relative flex size-14 flex-col items-center justify-center rounded-lg border-2 font-mono transition-all duration-200 sm:size-16 ${
                  cursorPosition === i
                    ? 'border-neon bg-neon/10 shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                    : cursorPosition > i
                      ? 'border-neon/30 bg-neon/5'
                      : 'border-line bg-surface/50'
                }`}
              >
                <span className='text-foreground text-xs sm:text-sm'>{toHexValue(i)}</span>
                <span className='text-[10px] text-muted-foreground sm:text-xs'>[{i}]</span>
              </div>
            ))}

            {/* Out of bounds indicator */}
            <div className='flex items-center px-2'>
              <span className='text-lg text-muted-foreground'>→</span>
            </div>

            {/* Invalid access cell with corruption effect */}
            <div
              className={`relative flex size-14 flex-col items-center justify-center rounded-lg border-2 border-dashed font-mono transition-all duration-200 sm:size-16 ${
                cursorPosition >= arraySize ? 'animate-pulse border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(255,0,0,0.4)]' : 'border-red-500/30 bg-surface'
              }`}
              style={
                cursorPosition >= arraySize
                  ? {
                      backgroundImage: `
                        repeating-linear-gradient(
                          0deg,
                          transparent,
                          transparent 2px,
                          rgba(255, 0, 0, 0.03) 2px,
                          rgba(255, 0, 0, 0.03) 4px
                        )
                      `,
                    }
                  : undefined
              }
            >
              <span className={`text-xs sm:text-sm ${cursorPosition >= arraySize ? 'animate-[glitch_0.3s_infinite] text-red-400' : 'text-muted-foreground'}`}>
                {cursorPosition >= arraySize ? corruptedText : '???'}
              </span>
              <span className='text-[10px] text-muted-foreground sm:text-xs'>[{targetIndex}]</span>

              {cursorPosition >= arraySize && (
                <div className='absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-white text-xs shadow-[0_0_10px_rgba(255,0,0,0.6)]'>
                  !
                </div>
              )}
            </div>
          </div>

          {/* Index indicator */}
          <div className='relative mt-4 h-2'>
            <div className='absolute inset-x-0 h-0.5 bg-line' />
            {cursorPosition >= 0 && (
              <div
                className={`absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 ${
                  cursorPosition >= arraySize ? 'bg-red-500 shadow-[0_0_8px_rgba(255,0,0,0.6)]' : 'bg-neon shadow-[0_0_8px_rgba(0,255,136,0.4)]'
                }`}
                style={{
                  left: `${Math.min(cursorPosition, arraySize) * (100 / (arraySize + 1)) + 100 / (arraySize + 1) / 2}%`,
                }}
              />
            )}
          </div>
        </div>

        {/* Error message - terminal output style */}
        {showError && (
          <div className='mb-8 w-full max-w-lg animate-[fadeIn_0.3s_ease-out] rounded-lg border border-red-500/50 bg-red-900/20 p-4'>
            <div className='flex items-start gap-3'>
              <div className='flex size-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-white text-xs'>!</div>
              <div>
                <div className='font-semibold text-red-400 text-sm'>java.lang.IndexOutOfBoundsException</div>
                <div className='mt-1 font-mono text-red-300 text-xs'>
                  Index {targetIndex} out of bounds for length {arraySize}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Code snippet - dark theme with syntax highlighting */}
        <div className='mb-8 w-full max-w-lg rounded-lg border border-line bg-surface p-4'>
          <div className='font-mono text-xs'>
            <div className='text-muted-foreground'>// Line 404</div>
            <div className='text-foreground'>
              <span className='text-cyan'>int</span> value = data[
              <span className='text-red-400'>{targetIndex}</span>]; <span className='text-red-400'>// ← Exception here</span>
            </div>
          </div>
        </div>

        {/* System Recovery button */}
        <Link
          to='/'
          className='group inline-flex items-center gap-3 border border-neon bg-transparent px-6 py-3 font-mono text-neon text-sm tracking-wider transition-all duration-300 hover:bg-neon/10 hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] focus:ring-2 focus:ring-neon focus:ring-offset-2 focus:ring-offset-background'
        >
          <span className='block size-2 animate-pulse rounded-full bg-neon' />
          <span>
            <span className='text-muted-foreground'>CONFIRM:</span> 境界を修正 → ホームへ戻る
          </span>
        </Link>
      </div>
    </div>
  );
};

export default IndexOutOfBounds;
