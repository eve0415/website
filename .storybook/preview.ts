import addonA11y from '@storybook/addon-a11y';
import addonDocs from '@storybook/addon-docs';
import { definePreview } from '@storybook/react-vite';

import '#routes/__root.css';

export default definePreview({
  addons: [addonA11y(), addonDocs()],
  parameters: {
    a11y: { test: 'todo' },
  },
});
