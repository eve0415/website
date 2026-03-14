// Shim for @vitest/browser/context
// In vite-plus-test, the `server` object is dynamically injected by the browser
// provider at runtime. This shim provides a compatible interface for storybook's
// prebundled code which imports `{ server }` statically.
//
// The real exports (page, cdp, etc.) are injected at runtime by the browser provider.
// This shim only needs to satisfy storybook's static import analysis.

// Provide a server stub for storybook compatibility
// The server.commands.getInitialGlobals is used by @storybook/addon-vitest
export const server = {
  platform: 'linux',
  version: '',
  provider: 'playwright',
  browser: 'chromium',
  commands: {
    // oxlint-disable-next-line typescript-eslint(require-await) -- Matches vitest async API
    getInitialGlobals: async () => ({}),
  },
  config: {},
};

export const { commands } = server;

// Provide stubs for browser context APIs
// These will be overridden at runtime by the browser provider
export const page = {};
export const cdp = () => {};
export const locators = {};
export const utils = {};
export const createUserEvent = () => ({});
