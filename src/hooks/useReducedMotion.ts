import { useSyncExternalStore } from 'react';

// Global override for test environments - checked before matchMedia
// This allows testAllViewports() to force reduced motion during screenshots
declare global {
  interface Window {
    __FORCE_REDUCED_MOTION__?: boolean;
  }
}

const getServerSnapshot = () => false;

const subscribe = (callback: () => void) => {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
};

const getSnapshot = () => {
  // Check global override first (for visual regression tests)
  if (typeof window !== 'undefined' && window.__FORCE_REDUCED_MOTION__ !== undefined) {
    return window.__FORCE_REDUCED_MOTION__;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const useReducedMotion = (): boolean => {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
