import type { LanguageStat } from '../../../-utils/github-stats-utils';
import type { FC } from 'react';

import { useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

export interface LanguageBarProps {
  language: LanguageStat;
  index: number;
  animate: boolean;
  isLast?: boolean;
  isLoading?: boolean;
}

// Generate bar string with filled and empty chars
const generateBar = (percentage: number, totalChars: number): string => {
  // Guard against invalid inputs
  if (!Number.isFinite(percentage) || !Number.isFinite(totalChars) || totalChars <= 0) {
    return '░'.repeat(Math.max(0, totalChars || 10));
  }
  const filled = Math.max(0, Math.min(totalChars, Math.round((percentage / 100) * totalChars)));
  const empty = Math.max(0, totalChars - filled);
  return '█'.repeat(filled) + '░'.repeat(empty);
};

const LanguageBar: FC<LanguageBarProps> = ({ language, index, animate, isLast = false, isLoading = false }) => {
  const reducedMotion = useReducedMotion();
  const shouldAnimate = animate && !reducedMotion;

  // Initialize state based on animate prop directly, avoiding setState in effect
  const [progress, setProgress] = useState(() => (shouldAnimate ? 0 : language.percentage));
  const [visible, setVisible] = useState(() => !shouldAnimate);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!shouldAnimate || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    // Stagger appearance
    const showTimeout = setTimeout(() => {
      setVisible(true);
    }, index * 150);

    // Animate progress bar
    const animateTimeout = setTimeout(
      () => {
        const duration = 800;
        const startTime = performance.now();

        const animateProgress = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progressRatio = Math.min(elapsed / duration, 1);
          // Ease out
          const easedProgress = 1 - Math.pow(1 - progressRatio, 3);
          setProgress(easedProgress * language.percentage);

          if (progressRatio < 1) {
            requestAnimationFrame(animateProgress);
          }
        };

        requestAnimationFrame(animateProgress);
      },
      index * 150 + 200,
    );

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(animateTimeout);
    };
  }, [shouldAnimate, index, language.percentage]);

  // Generate responsive bars
  const barMobile = isLoading ? '░'.repeat(10) : generateBar(progress, 10);
  const barTablet = isLoading ? '░'.repeat(15) : generateBar(progress, 15);
  const barDesktop = isLoading ? '░'.repeat(20) : generateBar(progress, 20);

  // Hex percentage for desktop display
  const hexValue = `0x${Math.floor(progress).toString(16).toUpperCase().padStart(2, '0')}`;

  // Bar color
  const barColor = isLoading ? 'var(--color-subtle-foreground)' : language.color;

  return (
    <div
      className={`group cursor-pointer border-l-2 border-l-transparent font-mono text-sm transition-all duration-fast hover:translate-x-0.5 hover:border-l-neon hover:bg-neon/5 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      {/* Unified layout: flex-wrap allows stacking on mobile, inline on tablet+ */}
      <div className='flex flex-wrap items-center'>
        {/* Name section - full width on mobile forces bar to wrap */}
        <div className='flex w-full items-center sm:w-auto sm:shrink-0'>
          <span className='text-subtle-foreground'>{isLast ? '└──' : '├──'}</span>
          <span className='ml-1'>
            {isLoading ? (
              <span className='animate-blink text-orange'>[LOADING...]</span>
            ) : (
              <span className='text-muted-foreground' title={language.name}>
                {language.name}
              </span>
            )}
          </span>
        </div>

        {/* Bar section - wraps to second row on mobile, inline on tablet+ */}
        <div className='flex w-full items-center pl-4 sm:w-auto sm:grow sm:pl-0'>
          {/* Mobile: vertical tree connector */}
          <span className='text-subtle-foreground sm:hidden'>│</span>
          {/* Growing dashed line */}
          <span className='ml-2 grow border-subtle-foreground/30 border-b sm:mx-1 sm:ml-0' />
          <span className='text-subtle-foreground'>┤</span>
          {/* Responsive bars - only bar length differs, decorative so OK to toggle visibility */}
          <span className='sm:hidden' style={{ color: barColor }}>
            {barMobile}
          </span>
          <span className='hidden sm:inline lg:hidden' style={{ color: barColor }}>
            {barTablet}
          </span>
          <span className='hidden lg:inline' style={{ color: barColor }}>
            {barDesktop}
          </span>
          <span className='text-subtle-foreground'>│</span>
          <span className='ml-1 text-subtle-foreground tabular-nums'>
            {isLoading ? '---' : `${progress.toFixed(1)}%`}
            {/* Hex value - desktop only, supplementary info */}
            {!isLoading && <span className='ml-1 hidden text-subtle-foreground lg:inline'>[{hexValue}]</span>}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LanguageBar;
