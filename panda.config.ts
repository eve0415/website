import { defineConfig } from '@pandacss/dev';

import { paperRecipe } from './panda/paper.recipe';

export default defineConfig({
  preflight: true,
  minify: true,
  hash: true,
  clean: true,
  include: ['./{app,components}/**/*.{js,jsx,ts,tsx}'],
  outdir: 'styled-system',
  theme: {
    extend: {
      recipes: {
        paper: paperRecipe,
      },
    },
  },
});
