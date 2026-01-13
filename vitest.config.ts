import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import storybookTest from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Suppress TanStack Router's Transitioner act() warnings globally.
    // Root cause: Transitioner performs async state updates via React.startTransition()
    // that happen outside of act() boundaries. This is a known limitation of testing
    // with TanStack Router's internal components.
    onConsoleLog(log) {
      if (log.includes('Transitioner') && log.includes('was not wrapped in act')) {
        return false; // Suppress
      }
      return true;
    },
    coverage: {
      enabled: true,
      provider: 'istanbul',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/routeTree.gen.ts', 'src/**/*.fixtures.tsx'],
    },
    projects: [
      {
        extends: true,
        plugins: [cloudflareTest({ wrangler: { configPath: './wrangler.json' } }), tailwindcss()],
        test: {
          name: 'unit',
          include: ['src/**/*.test.ts'],
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
        test: {
          name: 'browser',
          include: ['src/**/*.browser.test.{ts,tsx}'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['test/setup.ts'],
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
        plugins: [tailwindcss(), storybookTest()],
        test: {
          name: 'storybook',
          testTimeout: 60000,
          exclude: ['src/**/__screenshots__/**/*'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            // Firefox excluded due to unstable rendering causing flaky screenshot tests
            // Chromium + WebKit cover Chrome/Edge/Safari - sufficient cross-browser coverage
            instances: [{ browser: 'chromium' }, { browser: 'webkit' }],
            expect: {
              toMatchScreenshot: {
                timeout: 20000, // Wait up to 20s for stable screenshots (webkit needs more time)
                comparatorName: 'pixelmatch',
                comparatorOptions: {
                  allowedMismatchedPixelRatio: 0.01, // 1% threshold for animation artifacts
                  threshold: 0.3, // Higher threshold for gradients and anti-aliasing
                },
              },
            },
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
