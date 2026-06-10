import type { FC } from 'react';

import { useEffect, useRef } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';
import { useTypedText } from '#hooks/useTypedText';

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
  if (reducedMotion) return <StaticTerminalText {...props} />;

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
  const { displayedText, isComplete } = useTypedText({
    text,
    speed,
    initialDelay: delay,
    ...(onComplete !== undefined && { onComplete }),
  });

  return (
    <span className={`inline-block ${className}`}>
      {displayedText}
      {!isComplete && <span className='animate-blink bg-accent-primary ml-0.5 inline-block h-[1em] w-[0.5em]' />}
    </span>
  );
};

export default TerminalText;
