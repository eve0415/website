import type { FC } from 'react';

import { useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  /**
   * External visibility control from shared IntersectionObserver.
   * When provided, the component won't create its own observer.
   */
  isVisible?: boolean;
}

const AnimatedCounter: FC<AnimatedCounterProps> = ({ end, duration = 2000, suffix = '', isVisible }) => {
  const elementRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  const shouldSkipAnimation = reducedMotion || duration === 0;
  const [count, setCount] = useState(shouldSkipAnimation ? end : 0);

  // Use ref to track animation state (avoids setState in effect)
  const hasAnimatedRef = useRef(shouldSkipAnimation);

  // Internal visibility state (used when isVisible prop is not provided)
  const [internalVisible, setInternalVisible] = useState(false);
  const effectiveVisible = isVisible ?? internalVisible;

  // Set up internal observer only when isVisible prop is not provided
  useEffect(() => {
    // Skip if using external visibility control
    if (isVisible !== undefined) return;

    // Skip if already animated or should skip animation
    if (shouldSkipAnimation || hasAnimatedRef.current) return;

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setInternalVisible(true);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isVisible, shouldSkipAnimation]);

  // Animate when visible
  useEffect(() => {
    if (shouldSkipAnimation || hasAnimatedRef.current || !effectiveVisible) return;

    hasAnimatedRef.current = true;
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
  }, [effectiveVisible, end, duration, shouldSkipAnimation]);

  return (
    <span ref={elementRef} className='text-neon font-mono text-3xl'>
      {count}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
