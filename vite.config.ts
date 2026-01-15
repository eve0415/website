import { exec } from 'node:child_process';

import browserEcho from '@browser-echo/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';

export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: { name: 'ssr' },
    }),
    tanstackStart({
      router: {
        plugin: { vite: { environmentName: 'ssr' } },
        routeFileIgnorePattern: '.+\\.(test|browser\\.test|stories)\\.(ts|tsx)',
      },
      sitemap: { host: 'https://eve0415.net' },
    }),
    react({
      babel: { plugins: ['babel-plugin-react-compiler'] },
    }),
    tailwindcss(),
    devtools({
      eventBusConfig: {
        enabled: true,
      },
      editor: {
        name: 'VSCode',
        open: async (path, lineNumber, columnNumber) => {
          exec(`code -g "${path.replaceAll('$', '\\$')}${lineNumber ? `:${lineNumber}` : ''}${columnNumber ? `:${columnNumber}` : ''}"`);
        },
      },
    }),
    devtoolsJson(),
    browserEcho({
      injectHtml: false,
      stackMode: 'condensed',
    }),
  ],
  build: {
    minify: 'oxc',
  },
  css: {
    transformer: 'lightningcss',
    devSourcemap: true,
  },
  resolve: {
    tsconfigPaths: true,
  },
  optimizeDeps: {
    include: ['@tanstack/react-form-start > @tanstack/react-store'],
  },
});
