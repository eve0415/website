import type { FC } from "react";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      let currentIndex = 0;

      const typeInterval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
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
