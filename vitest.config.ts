import type { TestUserConfig } from 'vitest/config';

import { cloudflareTest } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

const CONTACT_FORM = 'src/routes/**/links/-/contact-form';

/** A project reads only its own `test` block, so both entries spread this. */
const SHARED = {
  restoreMocks: true,
  unstubEnvs: true,
  unstubGlobals: true,
  sequence: { shuffle: true },
  expect: { requireAssertions: true },
} satisfies TestUserConfig;

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [
          cloudflareTest({
            // Not wrangler.json's `main`, which is src/server.ts: its re-export of
            // TanStack Start's server entry needs the `#tanstack-router-entry` subpath
            // that only the tanstackStart Vite plugin supplies.
            main: './src/routes/{-$locale}/links/-/contact-form/rate-limiter.ts',
            // `.dev.vars` is gitignored, so in CI this binding would otherwise be absent
            // and every read of it would stringify to 'undefined'. A fake value here is
            // the same in both places, so a test can assert on it.
            miniflare: { bindings: { TURNSTILE_SECRET_KEY: 'test-turnstile-secret' } },
            wrangler: { configPath: './wrangler.json' },
          }),
        ],
        test: {
          name: 'worker',
          include: ['src/**/*.test.ts'],
          ...SHARED,
        },
      },
      {
        // No cloudflare plugin: these assert over `dist/`, and workerd has no `node:fs`.
        test: {
          name: 'dist',
          include: ['test/dist/**/*.test.ts'],
          // The default `exclude` carries `**/dist/**` and beats `include`, so
          // without this the project silently collects no files at all.
          exclude: ['**/node_modules/**'],
          ...SHARED,
        },
      },
    ],
    coverage: {
      enabled: true,
      // V8's native coverage is not available inside workerd.
      provider: 'istanbul',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/routeTree.gen.ts'],
      thresholds: {
        perFile: true,
        [`${CONTACT_FORM}/{form-state,rate-limiter,rate-limit-key,validation,turnstile/verify}.ts`]: { 100: true },
        'src/routes/**/-/sky/{palette,puffs,seeded-random}.ts': { 100: true },
        'src/lib/cn.ts': { 100: true },
        'src/i18n/{head,locale}.ts': { 100: true },
        'src/security-headers.ts': { 100: true },
      },
    },
  },
});
