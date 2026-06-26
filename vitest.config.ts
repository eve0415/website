import path from 'node:path';

import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import storybookTest from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStartTesting } from '@tanstack-router-testing/react-start-testing/vite';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    // Suppress TanStack Router's Transitioner act() warnings globally.
    // Root cause: Transitioner performs async state updates via React.startTransition()
    // that happen outside of act() boundaries. This is a known limitation of testing
    // with TanStack Router's internal components.
    onConsoleLog(log) {
      if (log.includes('Transitioner') && log.includes('was not wrapped in act')) return false; // Suppress

      return true;
    },
    coverage: {
      enabled: true,
      provider: 'istanbul',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/routeTree.gen.ts', 'src/generated/**', 'src/**/*.fixtures.tsx'],
    },
    projects: [
      {
        extends: true,
        plugins: [
          cloudflareTest({
            remoteBindings: false,
            wrangler: { configPath: './wrangler.json' },
            miniflare: {
              bindings: {
                GITHUB_PAT: 'test-pat',
                MAIL_ADDRESS: 'test@example.com',
                TURNSTILE_SECRET_KEY: 'test-turnstile-secret',
              },
            },
          }),
          tanstackStartTesting(),
          tailwindcss(),
        ],
        test: {
          name: 'unit',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        extends: true,
        plugins: [tanstackStartTesting()],
        resolve: {
          dedupe: ['react', 'react-dom'],
          alias: {
            'react-dom/server': path.resolve('test/stubs/react-dom-server.ts'),
            '@tanstack/react-form-start': path.resolve('test/stubs/tanstack-react-form-start.tsx'),
          },
        },
        optimizeDeps: {
          noDiscovery: true,
          include: [
            'react',
            'react-dom',
            'react/jsx-runtime',
            'react/jsx-dev-runtime',
            'react-dom/client',
            '@tanstack/react-router',
            '@tanstack/react-store',
            '@tanstack/react-form',
            'use-sync-external-store',
            'use-sync-external-store/shim/with-selector',
            'qrcode.react',
            '@tanstack/react-form-start > @tanstack/react-store',
          ],
          exclude: ['@tanstack/react-start', '@tanstack/start-client-core', '@tanstack/start-server-core', '@tanstack/start-static-server-functions'],
        },
        test: {
          name: 'browser',
          include: ['src/**/*.browser.test.{ts,tsx}'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['@tanstack-router-testing/react-start-testing/cleanup', 'test/setup.ts'],
        },
      },
      {
        extends: true,
        plugins: [tanstackStartTesting(), tailwindcss(), storybookTest()],
        resolve: {
          dedupe: ['react', 'react-dom'],
          alias: {
            'react-dom/server': path.resolve('test/stubs/react-dom-server.ts'),
            '@tanstack/react-form-start': path.resolve('test/stubs/tanstack-react-form-start.tsx'),
          },
        },
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
          setupFiles: ['@tanstack-router-testing/react-start-testing/cleanup', '.storybook/vitest.setup.ts'],
        },
        optimizeDeps: {
          include: ['@tanstack/react-form-start > @tanstack/react-store'],
          exclude: ['@tanstack/react-start', '@tanstack/start-client-core', '@tanstack/start-server-core', '@tanstack/start-static-server-functions'],
        },
      },
    ],
  },
});
