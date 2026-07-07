/**
 * Common parameters for ErrorVisualization stories.
 * Disables a11y color-contrast check since terminal aesthetics intentionally
 * use low-contrast colors for visual effect.
 */
export const errorVisualizationParameters = {
  layout: 'fullscreen' as const,
  a11y: {
    config: {
      rules: [{ id: 'color-contrast', enabled: false }],
    },
  },
};
