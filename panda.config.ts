import { defineConfig } from '@pandacss/dev';

import { paperRecipe } from './panda/paper.recipe';

export default defineConfig({
  preflight: true,
  minify: true,
  hash: true,
  clean: true,
  include: ['./{app,components}/**/*.{ts,tsx}'],
  outdir: 'styled-system',
  theme: {
    extend: {
      tokens: {
        fonts: {
          line: { value: 'var(--font-line)' },
        },
      },
      recipes: {
        paper: paperRecipe,
      },
    },
  },
});
