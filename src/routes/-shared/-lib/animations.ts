/**
 * Animation utility functions
 */

/**
 * Stagger delay for sequential animations
 */
export const staggerDelay = (index: number, baseDelay = 100): number => {
  return index * baseDelay;
};

/**
 * Generate animation style with stagger delay
 */
export const staggeredStyle = (index: number, baseDelay = 100): React.CSSProperties => ({
  animationDelay: `${staggerDelay(index, baseDelay)}ms`,
});

/**
 * Calculate parallax offset based on scroll/mouse position
 */
export const parallaxOffset = (value: number, intensity = 0.1): number => {
  return value * intensity;
};

/**
 * Lerp (linear interpolation) for smooth animations
 */
export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

/**
 * Clamp value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Map a value from one range to another
 */
export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

/**
 * Calculate SVG path length for stroke animations
 */
export const getPathLength = (pathElement: SVGPathElement | null): number => {
  if (!pathElement) return 0;
  return pathElement.getTotalLength();
};

/**
 * Easing functions
 */
export const easing = {
  easeOutExpo: (x: number): number => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  easeInOutExpo: (x: number): number =>
    x === 0
      ? 0
      : x === 1
        ? 1
        : x < 0.5
          ? Math.pow(2, 20 * x - 10) / 2
          : (2 - Math.pow(2, -20 * x + 10)) / 2,
  easeOutBack: (x: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  },
  easeOutElastic: (x: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  },
};
