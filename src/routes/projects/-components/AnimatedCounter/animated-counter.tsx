import type { FC } from 'react';

import { useEffect, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
}

const AnimatedCounter: FC<AnimatedCounterProps> = ({ end, duration = 2000, suffix = '' }) => {
  const reducedMotion = useReducedMotion();
  const shouldSkipAnimation = reducedMotion || duration === 0;
  const [count, setCount] = useState(shouldSkipAnimation ? end : 0);
  const [hasAnimated, setHasAnimated] = useState(shouldSkipAnimation);

  useEffect(() => {
    // Skip animation entirely if reduced motion or duration is 0
    // Initial state already handles this case
    if (shouldSkipAnimation || hasAnimated) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setHasAnimated(true);
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            if (progress >= 1) {
              setCount(end);
            } else {
              // Ease out expo
              const easeProgress = 1 - Math.pow(2, -10 * progress);
              setCount(Math.floor(end * easeProgress));
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 },
    );

    const element = document.querySelector(`[data-counter="${end}"]`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [end, duration, hasAnimated, shouldSkipAnimation]);

  return (
    <span data-counter={end} className='font-mono text-3xl text-neon'>
      {count}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
