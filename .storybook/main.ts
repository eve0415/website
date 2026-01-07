import { defineMain } from '@storybook/react-vite/node';

export default defineMain({
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.@(ts|tsx)', '!../src/**/__screenshots__/**', '!../src/**/__snapshots__/**'],
  addons: ['@storybook/addon-vitest', '@storybook/addon-a11y', '@storybook/addon-docs', '@storybook/addon-mcp'],
  features: {
    experimentalTestSyntax: true,
  },
});
