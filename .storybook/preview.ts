import addonA11y from '@storybook/addon-a11y';
import addonDocs from '@storybook/addon-docs';
import { definePreview } from '@storybook/react-vite';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';

// oxlint-disable-next-line eslint-plugin-import(no-unassigned-import) -- CSS side-effect import
import '#routes/__root.css';

// Note: CSS animation disabling is handled in vitest.setup.ts via
// window.__FORCE_REDUCED_MOTION__ and the useReducedMotion hook.
// The CSS override is injected there to ensure it's present before stories render.

export default definePreview({
  addons: [addonA11y(), addonDocs()],
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
    a11y: {
      test: 'error',
      // Disable scrollable-region-focusable - false positive from Storybook's centered layout container
      options: {
        rules: {
          'scrollable-region-focusable': { enabled: false },
        },
      },
    },
  },
  initialGlobals: {
    a11y: {
      manual: false,
    },
  },
});
