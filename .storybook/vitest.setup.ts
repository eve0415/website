import { beforeAll, beforeEach } from 'vitest';

import preview from './preview';

// Enable reduced motion globally for visual regression tests
// This ensures canvas-based animations are disabled for stable screenshots
// Tests that need to test animation behavior should set window.__FORCE_REDUCED_MOTION__ = false
if (typeof window !== 'undefined') {
  window.__FORCE_REDUCED_MOTION__ = true;
}

// Inject CSS to disable all animations for visual regression testing stability
// This is necessary because CSS media queries are evaluated by the browser engine,
// not through JavaScript's matchMedia, so mocking matchMedia doesn't affect them.
const injectReducedMotionCSS = () => {
  if (typeof document === 'undefined') return;
  const existingStyle = document.getElementById('vitest-reduced-motion-override');
  if (existingStyle) return;

  const style = document.createElement('style');
  style.id = 'vitest-reduced-motion-override';
  style.textContent = `
    *, *::before, *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
    /* Hide cursor blink in input fields */
    input, textarea {
      caret-color: transparent !important;
    }
  `;
  document.head.appendChild(style);
};

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

// Apply mocks immediately at module load
mockDesktopMatchMedia();
injectReducedMotionCSS();

// Also apply before each test to ensure it's in place after any resets
beforeEach(() => {
  mockDesktopMatchMedia();
  injectReducedMotionCSS();
  // Reset reduced motion to enabled for visual regression stability
  if (typeof window !== 'undefined') {
    window.__FORCE_REDUCED_MOTION__ = true;
  }
});

beforeAll(preview.composed.beforeAll);
