import { beforeAll, beforeEach } from 'vitest';

import preview from './preview';

// Enable reduced motion globally for visual regression tests
// This ensures canvas-based animations are disabled for stable screenshots
// Tests that need to test animation behavior should set window.__FORCE_REDUCED_MOTION__ = false
if (typeof window !== 'undefined') {
  window.__FORCE_REDUCED_MOTION__ = true;
}

// Mock matchMedia to simulate desktop environment for all Storybook tests
// This is needed because browser test environments may report touch device
const mockDesktopMatchMedia = () => {
  if (typeof window === 'undefined') return;
  const original = window.matchMedia.bind(window);
  window.matchMedia = (query: string): MediaQueryList => {
    // Desktop: fine pointer (mouse), no coarse pointer
    if (query === '(pointer: fine)') {
      return { matches: true, media: query, addEventListener: () => {}, removeEventListener: () => {} } as unknown as MediaQueryList;
    }
    if (query === '(pointer: coarse)') {
      return { matches: false, media: query, addEventListener: () => {}, removeEventListener: () => {} } as unknown as MediaQueryList;
    }
    // Reduced motion via matchMedia - also check global override
    if (query === '(prefers-reduced-motion: reduce)') {
      const matches = window.__FORCE_REDUCED_MOTION__ ?? false;
      return { matches, media: query, addEventListener: () => {}, removeEventListener: () => {} } as unknown as MediaQueryList;
    }
    return original(query);
  };
};

// Apply mock immediately at module load
mockDesktopMatchMedia();

// Also apply before each test to ensure it's in place after any resets
beforeEach(() => {
  mockDesktopMatchMedia();
  // Reset reduced motion to enabled for visual regression stability
  if (typeof window !== 'undefined') {
    window.__FORCE_REDUCED_MOTION__ = true;
  }
});

beforeAll(preview.composed.beforeAll);
