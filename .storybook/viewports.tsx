// Global type declaration for test environment flag
declare global {
  interface Window {
    __FORCE_REDUCED_MOTION__?: boolean;
  }
}

interface StoryContext {
  canvasElement: HTMLElement;
  id: string;
}

export const testViewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1280, height: 800 },
  desktop: { width: 1920, height: 1080 },
} as const;

export type ViewportName = keyof typeof testViewports;

/**
 * Sets the browser viewport to the specified size.
 * Used in story play functions to test responsive behavior.
 */
export async function setViewport(viewport: ViewportName): Promise<void> {
  const { page } = await import('vitest/browser');

  const { width, height } = testViewports[viewport];
  await page.viewport(width, height);
  await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Enables reduced motion globally for visual regression tests.
 * Must be called BEFORE component mount (e.g., in beforeAll or module scope).
 *
 * This sets window.__FORCE_REDUCED_MOTION__ which useReducedMotion() checks.
 */
export function enableReducedMotion(): void {
  if (typeof window !== 'undefined') {
    window.__FORCE_REDUCED_MOTION__ = true;
  }
}

/**
 * Disables reduced motion override, reverting to browser preference.
 */
export function disableReducedMotion(): void {
  if (typeof window !== 'undefined') {
    delete window.__FORCE_REDUCED_MOTION__;
  }
}

/**
 * Tests a story across all viewports with visual regression snapshots.
 * Snapshots stored at: __screenshots__/{browser}/{test-file}/{story-id}-{viewport}.png
 *
 * IMPORTANT: For canvas-based animations to be disabled during screenshots,
 * the story must use the withReducedMotion parameter or call enableReducedMotion()
 * before component mount.
 */
export async function testAllViewports(context: StoryContext): Promise<void> {
  const { page } = await import('vitest/browser');
  const { expect } = await import('vitest');

  for (const [viewport, { width, height }] of Object.entries(testViewports)) {
    await page.viewport(width, height);
    await new Promise(resolve => setTimeout(resolve, 100));

    const locator = page.elementLocator(context.canvasElement);
    await expect.element(locator).toMatchScreenshot(`${context.id}-${viewport}`);
  }
}
