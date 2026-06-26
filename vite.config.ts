import { exec } from 'node:child_process';

import { cloudflare } from '@cloudflare/vite-plugin';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
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
    devtools({
      eventBusConfig: {
        enabled: true,
      },
      editor: {
        name: 'VSCode',
        // oxlint-disable-next-line typescript/require-await
        open: async (path, lineNumber, columnNumber) => {
          exec(`code -g "${path.replaceAll('$', String.raw`\$`)}${lineNumber ? `:${lineNumber}` : ''}${columnNumber ? `:${columnNumber}` : ''}"`);
        },
      },
    }),
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
    tailwindcss(),
    devtoolsJson(),
  ],
  server: {
    host: true,
  },
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
