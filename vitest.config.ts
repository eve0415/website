import { createRequire } from 'node:module';
import path from 'node:path';

import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import storybookTest from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStartTesting } from '@tanstack-router-testing/react-start-testing/vite';
import { defineConfig } from 'vite-plus';
import { playwright } from 'vite-plus/test/browser-playwright';

const require = createRequire(import.meta.url);
const vitestDir = path.dirname(require.resolve('vitest'));
const vitestBrowserContextPath = path.join(vitestDir, 'dist/@vitest/browser/context.js');

// Plugin to shim @vitest/browser/context for storybook compatibility.
// In vite-plus-test, @vitest/browser is bundled inside vitest and the `server`
// export is injected at runtime by the browser provider. Storybook's prebundled
// code imports { server, page } from "@vitest/browser/context" which needs both
// the runtime-provided context AND the server stub.
// oxlint-disable-next-line typescript/consistent-type-imports -- Plugin type used as return type
const vitestBrowserShim = (): import('vite-plus').Plugin => ({
  name: 'vitest-browser-context-shim',
  enforce: 'pre',
  resolveId(id): string | undefined {
    if (id === '@vitest/browser/context') return '\0vitest-browser-context';
    if (id === '\0vitest-browser-context-original') return vitestBrowserContextPath;
    return undefined;
  },
  load(id): string | undefined {
    if (id === '\0vitest-browser-context') {
      return `
export { cdp, createUserEvent, locators, page, utils } from '\0vitest-browser-context-original';
export const server = {
  platform: 'linux',
  version: '',
  provider: 'playwright',
  browser: typeof globalThis.__vitest_browser_runner__ !== 'undefined'
    ? globalThis.__vitest_browser_runner__.config?.browser?.name ?? 'chromium'
    : 'chromium',
  commands: typeof globalThis.__vitest_browser_runner__ !== 'undefined'
    ? globalThis.__vitest_browser_runner__.commands ?? { getInitialGlobals: async () => ({}) }
    : { getInitialGlobals: async () => ({}) },
  config: typeof globalThis.__vitest_browser_runner__ !== 'undefined'
    ? globalThis.__vitest_browser_runner__.config ?? {}
    : {},
};
export const commands = server.commands;
`;
    }
    return undefined;
  },
});

// Stub TanStack Start's build-time virtual modules so they resolve in workerd.
// These are normally provided at build time and by tanstackStartTesting's
// virtual stubs plugin (aliasReactStart: true), but we use aliasReactStart: false
// to keep the real createServerFn/createServerOnlyFn behavior.
const TANSTACK_VIRTUAL_IDS = new Set([
  '#tanstack-router-entry',
  '#tanstack-start-entry',
  '#tanstack-start-plugin-adapters',
  '#tanstack-start-server-fn-resolver',
  'virtual:tanstack-rsc-ssr-decode',
  'virtual:tanstack-rsc-browser-decode',
  'tanstack-start-manifest:v',
  'tanstack-start-injected-head-scripts:v',
]);

// oxlint-disable-next-line typescript/consistent-type-imports -- Plugin type used as return type
const tanstackVirtualStubs = (): import('vite-plus').Plugin => ({
  name: 'tanstack-virtual-stubs',
  enforce: 'pre',
  resolveId(id) {
    return TANSTACK_VIRTUAL_IDS.has(id) ? `\0${id}` : undefined;
  },
  load(id) {
    return id.startsWith('\0') && TANSTACK_VIRTUAL_IDS.has(id.slice(1)) ? 'export default {}; export {};' : undefined;
  },
});

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
      exclude: ['src/routeTree.gen.ts', 'src/**/*.fixtures.tsx'],
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
                CLOUDFLARE_API_TOKEN: 'test-cf-token',
                CLOUDFLARE_ZONE_ID: 'test-zone-id',
              },
            },
          }),
          tanstackStartTesting({ aliasReactStart: false }),
          tanstackVirtualStubs(),
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
        plugins: [tanstackStartTesting(), vitestBrowserShim(), tailwindcss(), storybookTest()],
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
