import type { ErrorComponentProps } from '@tanstack/react-router';
import type { FC } from 'react';

import { useEffect, useMemo, useState } from 'react';

import { SudoRmRfError } from '#routes/sys/-components/Terminal/commands';

// QR code destinations for the easter egg
const QR_DESTINATIONS = [
  { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', label: 'youtube.com/watch?v=dQw4w9WgXcQ' },
  { url: 'https://github.com/eve0415', label: 'github.com/eve0415' },
  { url: 'https://eve0415.net', label: 'eve0415.net' },
] as const;

// Simple QR-like pattern generator (visual only, not scannable)
const FakeQRCode: FC<{ size?: number }> = ({ size = 100 }) => {
  const pattern = useMemo(() => {
    // Generate a pseudo-random but deterministic pattern
    const cells: boolean[][] = [];
    for (let y = 0; y < 21; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < 21; x++) {
        // Position detection patterns (corners)
        const isTopLeft = x < 7 && y < 7;
        const isTopRight = x >= 14 && y < 7;
        const isBottomLeft = x < 7 && y >= 14;

        if (isTopLeft || isTopRight || isBottomLeft) {
          // Draw finder patterns
          const localX = x % 7;
          const localY = y % 7;
          const isOuter = localX === 0 || localX === 6 || localY === 0 || localY === 6;
          const isInner = localX >= 2 && localX <= 4 && localY >= 2 && localY <= 4;
          row.push(isOuter || isInner);
        } else {
          // Random-ish data pattern
          row.push(Math.sin(x * 7 + y * 13) > 0);
        }
      }
      cells.push(row);
    }
    return cells;
  }, []);

  const cellSize = size / 21;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className='bg-white'>
      {pattern.map((row, y) =>
        row.map((filled, x) => filled && <rect key={`${x}-${y}`} x={x * cellSize} y={y * cellSize} width={cellSize} height={cellSize} fill='black' />),
      )}
    </svg>
  );
};

const BSODError: FC<ErrorComponentProps> = ({ error, reset }) => {
  const [destination] = useState(() => QR_DESTINATIONS[Math.floor(Math.random() * QR_DESTINATIONS.length)]);
  const [progress, setProgress] = useState(0);

  // Check if this is our intentional crash
  const isIntentionalCrash = error instanceof SudoRmRfError;

  // Fake progress animation
  useEffect(() => {
    if (!isIntentionalCrash) return;

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isIntentionalCrash]);

  // If not intentional crash, show a simpler error
  if (!isIntentionalCrash) {
    return (
      <div className='flex min-h-dvh items-center justify-center bg-background p-8'>
        <div className='max-w-md text-center'>
          <h1 className='mb-4 font-mono text-2xl text-red-400'>Error</h1>
          <p className='mb-6 text-subtle-foreground'>{error.message || 'An unexpected error occurred'}</p>
          <button type='button' onClick={reset} className='rounded border border-neon px-4 py-2 font-mono text-neon transition-colors hover:bg-neon/10'>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Windows 11-style BSOD
  return (
    <div className='fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0078d4] p-8 text-white'>
      {/* Sad face */}
      <div className='mb-8 font-sans text-[120px] leading-none md:text-[180px]'>:(</div>

      {/* Main message */}
      <div className='mb-6 max-w-2xl text-center'>
        <p className='mb-4 text-lg md:text-2xl'>Your PC ran into a problem and needs to restart.</p>
        <p className='text-sm opacity-80 md:text-base'>We're just collecting some error info, and then we'll restart for you.</p>
      </div>

      {/* Progress */}
      <div data-testid='bsod-progress' className='mb-8 text-xl md:text-2xl'>
        {Math.min(Math.floor(progress), 100)}% complete
      </div>

      {/* QR Code section */}
      <div className='flex flex-col items-center gap-4 md:flex-row md:gap-8'>
        <div data-testid='bsod-qrcode'>
          <FakeQRCode size={80} />
        </div>
        <div className='text-left text-sm'>
          <p className='mb-2 opacity-80'>For more information about this issue and possible fixes, visit:</p>
          <a href={destination?.url} target='_blank' rel='noopener noreferrer' className='text-white/90 underline decoration-white/50 hover:decoration-white'>
            {destination?.label}
          </a>
        </div>
      </div>

      {/* Stop code */}
      <div data-testid='bsod-stopcode' className='mt-8 font-mono text-xs opacity-60'>
        <p>Stop code: SYSTEM_DIAGNOSTIC_FAILURE</p>
      </div>

      {/* Reset button (appears after progress completes) */}
      {progress >= 100 && (
        <button
          data-testid='bsod-reset'
          type='button'
          onClick={reset}
          className='mt-8 rounded bg-white/10 px-6 py-3 font-mono text-sm transition-colors hover:bg-white/20'
        >
          Press any key to restart...
        </button>
      )}
    </div>
  );
};

export default BSODError;
