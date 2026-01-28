import { configure } from 'vitest-browser-react/pure';

// oxlint-disable-next-line eslint-plugin-jest(require-hook) -- Setup file runs at module load
configure({
  reactStrictMode: true,
});
