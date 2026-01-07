import type { LanguageStat } from '../../../-utils/github-stats-utils';
import type { FC } from 'react';

import { useEffect, useRef, useState } from 'react';

export interface LanguageBarProps {
  language: LanguageStat;
  index: number;
  animate: boolean;
}

const LanguageBar: FC<LanguageBarProps> = ({ language, index, animate }) => {
  // Initialize state based on animate prop directly, avoiding setState in effect
  const [progress, setProgress] = useState(() => (animate ? 0 : language.percentage));
  const [visible, setVisible] = useState(() => !animate);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!animate || hasAnimatedRef.current) return;
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
  }, [animate, index, language.percentage]);

  // Calculate bar characters (20 chars total)
  const totalChars = 20;
  const filledChars = Math.min(totalChars, Math.round((progress / 100) * totalChars));
  const emptyChars = Math.max(0, totalChars - filledChars);

  const bar = '█'.repeat(filledChars) + '░'.repeat(emptyChars);

  return (
    <div
      className={`font-mono text-sm transition-opacity duration-normal ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <div className='flex items-center gap-2'>
        {/* Tree structure */}
        <span className='text-subtle-foreground'>├──</span>

        {/* Language name */}
        <span className='w-24 truncate text-muted-foreground'>{language.name}</span>

        {/* Progress bar */}
        <span style={{ color: language.color }}>{bar}</span>

        {/* Percentage */}
        <span className='w-16 text-right text-subtle-foreground'>{progress.toFixed(1)}%</span>
      </div>
    </div>
  );
};

export default LanguageBar;
