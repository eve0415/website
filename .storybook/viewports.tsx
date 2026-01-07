import type { JSX } from 'react';

export const testViewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1280, height: 800 },
  desktop: { width: 1920, height: 1080 },
} as const;

export type ViewportName = keyof typeof testViewports;

/**
 * Sets the browser viewport to the specified size
 * Used in story play functions to test responsive behavior
 */
export async function setViewport(viewport: ViewportName): Promise<void> {
  const { page } = await import('vitest/browser');

  const { width, height } = testViewports[viewport];
  await page.viewport(width, height);

  // Give layout time to settle after resize (using setTimeout in a promise)
  await new Promise(resolve => setTimeout(resolve, 100));
}

interface TestAllViewportsOptions {
  assertions?: (viewport: ViewportName) => Promise<void>;
}

interface StoryContext {
  canvasElement: HTMLElement;
  id: string;
}

/**
 * Tests a story across all viewports with visual regression snapshots.
 *
 * Usage in play function:
 * ```tsx
 * play: async (context) => {
 *   await testAllViewports(context);
 * }
 * ```
 *
 * Snapshots are stored in: __snapshots__/{browser}/{storyId}-{viewport}.png
 */
export async function testAllViewports(context: StoryContext, options?: TestAllViewportsOptions): Promise<void> {
  const { page, server } = await import('vitest/browser');
  const { expect } = await import('vitest');

  const viewportNames = Object.keys(testViewports) as ViewportName[];

  // Get current browser name (chromium, firefox, webkit)
  const browserName = server.browser;

  for (const viewport of viewportNames) {
    await setViewport(viewport);

    if (options?.assertions) {
      await options.assertions(viewport);
    }

    // Capture screenshot as buffer
    const screenshot = await page.screenshot({ element: context.canvasElement });

    // Relative path - Vitest resolves relative to test file
    const snapshotPath = `__snapshots__/${browserName}/${context.id}-${viewport}.png`;
    await expect(screenshot).toMatchFileSnapshot(snapshotPath);
  }
}

/**
 * Decorator to disable animations for visual regression testing.
 * Mocks prefers-reduced-motion media query to return true.
 */
export const withDisabledAnimations = (Story: () => JSX.Element): JSX.Element => {
  const originalMatchMedia = window.matchMedia;
  window.matchMedia = (query: string): MediaQueryList => {
    if (query === '(prefers-reduced-motion: reduce)') {
      return {
        matches: true,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      } as MediaQueryList;
    }
    return originalMatchMedia(query);
  };

  return <Story />;
};
