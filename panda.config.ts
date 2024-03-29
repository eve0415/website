import { defineConfig } from '@pandacss/dev';

import { paperRecipe } from './panda/paper.recipe';

export default defineConfig({
  preflight: true,
  minify: true,
  hash: true,
  clean: true,
  include: ['./app/**/*.{ts,tsx}'],
  outdir: 'styled-system',
  theme: {
    extend: {
      tokens: {
        fonts: {
          line: { value: 'var(--font-line)' },
          neon: { value: 'var(--font-neon)' },
        },
      },
      recipes: {
        paper: paperRecipe,
      },
    },
  },
});
