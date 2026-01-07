export const testViewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1280, height: 800 },
  desktop: { width: 1920, height: 1080 },
} as const;

export type ViewportName = keyof typeof testViewports;

export const chromaticModes = Object.fromEntries(Object.entries(testViewports).map(([name, viewport]) => [name, { viewport }])) as Record<
  ViewportName,
  { viewport: (typeof testViewports)[ViewportName] }
>;
