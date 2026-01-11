import type { FC } from 'react';

import { useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

interface Props {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

const TerminalText: FC<Props> = props => {
  const reducedMotion = useReducedMotion();

  // For reduced motion, skip animation entirely
  if (reducedMotion) {
    return <StaticTerminalText {...props} />;
  }

  // Animation path - this is now a separate component conceptually
  return <AnimatedTerminalText {...props} />;
};

// Static version for reduced motion - calls onComplete immediately
const StaticTerminalText: FC<Props> = ({ text, className = '', onComplete }) => {
  const onCompleteRef = useRef(onComplete);

  // Keep ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Call onComplete on mount
  useEffect(() => {
    onCompleteRef.current?.();
  }, []);

  return <span className={`inline-block ${className}`}>{text}</span>;
};

// Extracted animated version to avoid conditional hook calls
const AnimatedTerminalText: FC<Props> = ({ text, delay = 0, speed = 50, className = '', onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const currentIndexRef = useRef(0);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    currentIndexRef.current = 0;
    let isCancelled = false;

    const delayTimer = setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (isCancelled) {
          clearInterval(typeInterval);
          return;
        }

        if (currentIndexRef.current < text.length) {
          setDisplayedText(text.slice(0, currentIndexRef.current + 1));
          currentIndexRef.current += 1;
        } else {
          clearInterval(typeInterval);
          setIsComplete(true);
          onCompleteRef.current?.();
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }, delay);

    return () => {
      isCancelled = true;
      clearTimeout(delayTimer);
    };
  }, [text, delay, speed]);

  return (
    <span className={`inline-block ${className}`}>
      {displayedText}
      {!isComplete && <span className='ml-0.5 inline-block h-[1em] w-[0.5em] animate-blink bg-accent-primary' />}
    </span>
  );
};

export default TerminalText;
