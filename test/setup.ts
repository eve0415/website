import { clearStartMocks } from '@tanstack-router-testing/react-start-testing/browser';
import { afterEach } from 'vite-plus/test';
import { configure } from 'vitest-browser-react/pure';

// oxlint-disable-next-line vitest/require-hook -- Setup file runs at module load
configure({
  reactStrictMode: true,
});

// oxlint-disable-next-line vitest/require-top-level-describe -- Setup file registers global cleanup
afterEach(() => {
  clearStartMocks();
});
