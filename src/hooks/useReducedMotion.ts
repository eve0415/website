import { useSyncExternalStore } from 'react';

// Global override for test environments - checked before matchMedia
// This allows testAllViewports() to force reduced motion during screenshots
declare global {
  var __FORCE_REDUCED_MOTION__: boolean | undefined;
}

const getServerSnapshot = () => false;

// oxlint-disable-next-line eslint-plugin-promise(prefer-await-to-callbacks) -- useSyncExternalStore requires callback subscription pattern
const subscribe = (callback: () => void) => {
  const mediaQuery = globalThis.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => {
    mediaQuery.removeEventListener('change', callback);
  };
};

const getSnapshot = () => {
  // Check global override first (for visual regression tests)
  if (globalThis.window !== undefined && globalThis.__FORCE_REDUCED_MOTION__ !== undefined) return globalThis.__FORCE_REDUCED_MOTION__;

  return globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const useReducedMotion = (): boolean => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
