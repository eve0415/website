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
        [`${CONTACT_FORM}/rate-limiter.ts`]: { statements: 100, branches: 100, functions: 100, lines: 100 },
        [`${CONTACT_FORM}/validation.ts`]: { statements: 100, branches: 100, functions: 100, lines: 100 },
        // Not 100: parseHextets' four-octet guard is unreachable, because parseIpv4
        // returns only when DOTTED_QUAD has already matched four groups.
        [`${CONTACT_FORM}/rate-limit-key.ts`]: { statements: 98.46, branches: 97.67, functions: 100, lines: 100 },
      },
    },
  },
});
