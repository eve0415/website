import { defineConfig } from '@pandacss/dev';

import { boxRecipe } from './panda/box.recipe';

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
        box: boxRecipe,
      },
    },
  },
});
