import { defineConfig } from '@playwright/test';

/** `vite preview`'s own default, spelled out because the spec's `baseURL` has to agree with it. */
const PORT = 4173;
const ORIGIN = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  // A hydration error that only shows up sometimes is the signal these tests
  // exist for; a retry would average it away.
  retries: 0,
  use: {
    baseURL: ORIGIN,
    browserName: 'chromium',
    // Pinned so the spec's fixed clock lands on a known local hour: `SkyClock`
    // reads local time, and the marker the spec waits on is written only when
    // that reading differs from the prerendered 深夜 0時.
    timezoneId: 'UTC',
  },
  webServer: {
    // The built output through workerd, `_headers` and all — not `vite dev`,
    // which never prerenders and so never hydrates prerendered HTML.
    command: `pnpm exec vite preview --port ${PORT} --strictPort`,
    url: ORIGIN,
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
