import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import storybookTest from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: 'istanbul',
    },
    projects: [
      {
        extends: true,
        plugins: [cloudflareTest({})],
        test: {
          name: 'unit',
          include: ['src/**/*.test.ts'],
          exclude: ['**/*.stories.tsx'],
          environment: 'node',
          server: {
            deps: {
              // Inline @tanstack packages so that our virtual module plugin can intercept
              // the #tanstack-start-server-fn-manifest import
              inline: ['@tanstack/start-server-core', '@tanstack/react-start'],
            },
          },
        },
      },
      {
        extends: true,
        plugins: [cloudflareTest({}), storybookTest()],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }, { browser: 'firefox' }, { browser: 'webkit' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
          server: {
            deps: {
              // Inline @tanstack packages so that our virtual module plugin can intercept
              // the #tanstack-start-server-fn-manifest import
              inline: ['@tanstack/start-server-core', '@tanstack/react-start'],
            },
          },
        },
      },
    ],
  },
});
