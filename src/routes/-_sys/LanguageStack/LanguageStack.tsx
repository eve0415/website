import type { FC } from "react";
import type { LanguageStat } from "../github-api";

import { useEffect, useRef, useState } from "react";

interface LanguageStackProps {
  languages: LanguageStat[];
  animate: boolean;
}

interface LanguageBarProps {
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
  const filledChars = Math.round((progress / 100) * totalChars);
  const emptyChars = totalChars - filledChars;

  const bar = "█".repeat(filledChars) + "░".repeat(emptyChars);

  return (
    <div
      className={`font-mono text-sm transition-opacity duration-normal ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-2">
        {/* Tree structure */}
        <span className="text-text-muted">├──</span>

        {/* Language name */}
        <span className="w-24 truncate text-text-secondary">{language.name}</span>

        {/* Progress bar */}
        <span style={{ color: language.color }}>{bar}</span>

        {/* Percentage */}
        <span className="w-16 text-right text-text-muted">{progress.toFixed(1)}%</span>
      </div>
    </div>
  );
};

const LanguageStack: FC<LanguageStackProps> = ({ languages, animate }) => {
  if (languages.length === 0) {
    return (
      <div className="font-mono text-sm text-text-muted">
        <span className="text-accent-tertiary">[NO_DATA]</span> 言語データが見つかりません
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-3 font-mono text-text-muted text-xs">
        <span className="text-accent-primary">[</span>
        <span>STACK_ANALYSIS</span>
        <span className="text-accent-primary">]</span>
        <span className="ml-2 opacity-50">// リポジトリ言語分布</span>
      </div>

      <div className="space-y-1 rounded border border-border-subtle bg-bg-secondary/50 p-4">
        {languages.map((lang, index) => (
          <LanguageBar key={lang.name} language={lang} index={index} animate={animate} />
        ))}

        {/* Footer tree end */}
        <div className="font-mono text-sm text-text-muted">
          <span>└── </span>
          <span className="opacity-50">EOF</span>
        </div>
      </div>
    </div>
  );
};

export default LanguageStack;
