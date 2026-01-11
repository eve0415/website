import type { ErrorComponentProps } from '@tanstack/react-router';
import type { FC } from 'react';

import { Link } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';
import { SudoRmRfError } from '#routes/sys/-components/Terminal/commands';

import { QR_DESTINATIONS, REPO_LABEL, REPO_URL } from './destinations';
import { getRandomMessage } from './messages';
import QRCode from './qr-code';

const BSODError: FC<ErrorComponentProps> = ({ error, reset }) => {
  const isEasterEgg = error instanceof SudoRmRfError;
  const reducedMotion = useReducedMotion();

  // Random selections (stable per render)
  const [qrDestination] = useState(() => {
    const index = Math.floor(Math.random() * QR_DESTINATIONS.length);
    return QR_DESTINATIONS[index]!;
  });
  const [message] = useState(() => getRandomMessage(isEasterEgg));

  // Progress animation - skip if reduced motion
  const [progress, setProgress] = useState(() => (reducedMotion ? 100 : 0));
  const isComplete = progress >= 100;

  // Progress animation effect
  useEffect(() => {
    // Skip animation if reduced motion preference is enabled
    if (reducedMotion) return;

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
  }, [reducedMotion]);

  // Keypress listener (only when complete)
  useEffect(() => {
    if (!isComplete) return;
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      reset();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isComplete, reset]);

  // Reset handler for button click
  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div className='fixed inset-0 z-9999 overflow-y-auto bg-[#0078d4] p-4 text-white md:p-8'>
      <div className='flex min-h-full flex-col items-center justify-center py-8'>
        {/* Sad face */}
        <div className='mb-6 font-sans text-[80px] leading-none sm:text-[120px] md:mb-8 md:text-[180px]'>:(</div>

        {/* Main message */}
        <div className='mb-6 max-w-2xl text-center'>
          <p className='mb-4 text-lg md:text-2xl'>{message.main}</p>
          <p className='text-sm md:text-base'>{message.sub}</p>
        </div>

        {/* Progress */}
        <div data-testid='bsod-progress' className='mb-8 text-xl md:text-2xl'>
          {Math.min(Math.floor(progress), 100)}% complete
        </div>

        {/* QR Code section */}
        <div className='flex flex-col items-center gap-4 md:flex-row md:gap-8'>
          <div data-testid='bsod-qrcode'>
            <QRCode url={qrDestination.url} size={80} />
          </div>
          <div className='text-left text-sm'>
            <p className='mb-2'>For more information about this issue and possible fixes, visit:</p>
            <a href={REPO_URL} target='_blank' rel='noopener noreferrer' className='text-white underline decoration-white/50 hover:decoration-white'>
              {REPO_LABEL}
            </a>
          </div>
        </div>

        {/* Stop code (real error message) */}
        <div data-testid='bsod-stopcode' className='mt-8 max-w-xl font-mono text-xs'>
          <p className='whitespace-pre-wrap'>Stop code: {error.message || 'UNKNOWN_ERROR'}</p>
        </div>

        {/* Buttons - Only show after progress completes */}
        {isComplete && (
          <div className='mt-8 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4'>
            <button
              data-testid='bsod-reset'
              type='button'
              onClick={handleReset}
              className='w-full rounded bg-white px-8 py-2.5 font-semibold text-[#0078d4] shadow-sm transition-all hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-white/50 active:scale-95 sm:w-auto'
            >
              Restart
            </button>

            <Link
              data-testid='bsod-home'
              to='/'
              className='flex w-full items-center justify-center rounded border border-white/40 bg-transparent px-8 py-2.5 text-center text-white backdrop-blur-sm transition-all hover:bg-white/10 focus:outline-hidden focus:ring-2 focus:ring-white/50 active:scale-95 sm:w-auto'
            >
              Home
            </Link>

            {isEasterEgg && (
              <Link
                data-testid='bsod-revert'
                to='/sys'
                className='flex w-full items-center justify-center rounded border border-white/40 bg-transparent px-8 py-2.5 text-center text-white backdrop-blur-sm transition-all hover:bg-white/10 focus:outline-hidden focus:ring-2 focus:ring-white/50 active:scale-95 sm:w-auto'
              >
                Revert
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BSODError;
