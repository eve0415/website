import type { Decorator } from '@storybook/react-vite';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';

/**
 * Decorator that provides TanStack Router context for Link components.
 * Required for ErrorVisualization components that navigate to home.
 */
export const withRouter: Decorator = Story => {
  const rootRoute = createRootRoute({
    component: Story,
  });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/404'] }),
  });
  return <RouterProvider router={router} />;
};

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
