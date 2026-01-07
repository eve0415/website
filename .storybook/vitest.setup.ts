import { beforeAll, beforeEach } from 'vitest';

import preview from './preview';

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
    // Reduced motion: disabled by default
    if (query === '(prefers-reduced-motion: reduce)') {
      return { matches: false, media: query, addEventListener: () => {}, removeEventListener: () => {} } as unknown as MediaQueryList;
    }
    return original(query);
  };
};

// Apply mock immediately at module load
mockDesktopMatchMedia();

// Also apply before each test to ensure it's in place after any resets
beforeEach(() => {
  mockDesktopMatchMedia();
});

beforeAll(preview.composed.beforeAll);
