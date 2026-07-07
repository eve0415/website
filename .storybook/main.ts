import { defineMain } from '@storybook/tanstack-react/node';

export default defineMain({
  framework: '@storybook/tanstack-react',
  stories: ['../src/**/*.stories.@(ts|tsx)', '!../src/**/__screenshots__/**', '!../src/**/__snapshots__/**'],
  addons: ['@storybook/addon-vitest', '@storybook/addon-a11y', '@storybook/addon-docs', '@storybook/addon-mcp'],
  features: {
    experimentalTestSyntax: true,
  },
});
