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
    tanstackStart(),
    devtools({
      eventBusConfig: { enabled: true },
    }),
    react(),
    babel({
      presets: [reactCompilerPreset({ panicThreshold: 'critical_errors' })],
    }),
    tailwindcss(),
    devtoolsJson(),
  ],
  environments: {
    ssr: {
      build: {
        minify: 'oxc',
        sourcemap: true,
      },
    },
  },
  server: {
    host: true,
  },
});
