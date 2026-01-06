import type { FC } from "react";

import { useEffect, useRef, useState } from "react";

interface Props {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

const TerminalText: FC<Props> = ({ text, delay = 0, speed = 50, className = "", onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const currentIndexRef = useRef(0);

  useEffect(() => {
    currentIndexRef.current = 0;

    const delayTimer = setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (currentIndexRef.current < text.length) {
          setDisplayedText(text.slice(0, currentIndexRef.current + 1));
          currentIndexRef.current += 1;
        } else {
          clearInterval(typeInterval);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }, delay);

    return () => clearTimeout(delayTimer);
  }, [text, delay, speed, onComplete]);

  return (
    <span className={`inline-block ${className}`}>
      {displayedText}
      {!isComplete && (
        <span className="ml-0.5 inline-block h-[1em] w-[0.5em] animate-blink bg-accent-primary" />
      )}
    </span>
  );
};

export default TerminalText;
