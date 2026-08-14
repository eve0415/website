import { defineConfig } from 'oxfmt';

export default defineConfig({
  ignorePatterns: ['.wrangler', 'dist', 'worker-configuration.d.ts', 'src/routeTree.gen.ts', 'tools/oxlint/anti-slop'],
  arrowParens: 'avoid',
  singleQuote: true,
  jsxSingleQuote: true,
  printWidth: 160,
  sortTailwindcss: true,
  sortImports: {
    order: 'asc',
    groups: [['type'], ['builtin'], ['external'], ['subpath', 'internal'], ['parent'], ['sibling'], ['index']],
  },
});
