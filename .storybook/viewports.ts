import { page } from 'vitest/browser';

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
  const { width, height } = testViewports[viewport];
  await page.viewport(width, height);

  // Give layout time to settle after resize (using setTimeout in a promise)
  await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Tests a story across all viewports, taking snapshots for visual regression
 *
 * Usage in play function:
 * ```tsx
 * play: async ({ canvasElement }) => {
 *   await testAllViewports(canvasElement, async (viewport) => {
 *     // Optional: viewport-specific assertions
 *     const canvas = within(canvasElement);
 *     await expect(canvas.getByText('Header')).toBeVisible();
 *   });
 * }
 * ```
 */
export async function testAllViewports(canvasElement: HTMLElement, assertions?: (viewport: ViewportName) => Promise<void>): Promise<void> {
  const viewportNames = Object.keys(testViewports) as ViewportName[];

  for (const viewport of viewportNames) {
    // Set viewport size
    await setViewport(viewport);

    // Run viewport-specific assertions if provided
    if (assertions) {
      await assertions(viewport);
    }

    // Take screenshot for visual regression
    // Screenshots are automatically saved to __screenshots__ directory
    await page.screenshot({
      element: canvasElement,
      path: `${viewport}.png`,
    });
  }
}
