import { useCallback, useEffect, useState } from "react";

interface ScrollProgress {
  progress: number;
  scrollY: number;
  direction: "up" | "down" | null;
}

export const useScrollProgress = (): ScrollProgress => {
  const [state, setState] = useState<ScrollProgress>({
    progress: 0,
    scrollY: 0,
    direction: null,
  });

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? scrollY / maxScroll : 0;

    setState((prev) => ({
      progress,
      scrollY,
      direction: scrollY > prev.scrollY ? "down" : scrollY < prev.scrollY ? "up" : prev.direction,
    }));
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return state;
};
