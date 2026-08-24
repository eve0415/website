import { cloudflareTest } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

const CONTACT_FORM = 'src/routes/**/links/-/contact-form';

export default defineConfig({
  plugins: [
    cloudflareTest({
      // Not wrangler.json's `main`, which is src/server.ts: its re-export of
      // TanStack Start's server entry needs the `#tanstack-router-entry` subpath
      // that only the tanstackStart Vite plugin supplies.
      main: './src/routes/{-$locale}/links/-/contact-form/rate-limiter.ts',
      wrangler: { configPath: './wrangler.json' },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    sequence: { shuffle: true },
    expect: { requireAssertions: true },
    coverage: {
      enabled: true,
      // V8's native coverage is not available inside workerd.
      provider: 'istanbul',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/routeTree.gen.ts'],
      thresholds: {
        perFile: true,
        [`${CONTACT_FORM}/{form-state,rate-limiter,rate-limit-key,validation}.ts`]: { 100: true },
        'src/i18n/{head,locale}.ts': { 100: true },
        'src/security-headers.ts': { 100: true },
      },
    },
  },
});
