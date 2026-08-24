import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['eslint', 'typescript', 'unicorn', 'oxc', 'import', 'react', 'react-perf', 'jsx-a11y', 'node', 'promise'],
  jsPlugins: ['@tanstack/eslint-plugin-router', 'oxlint-tailwindcss', { name: 'anti-slop', specifier: './tools/oxlint/anti-slop/src/index.ts' }],
  ignorePatterns: ['.wrangler', 'coverage', 'dist', 'worker-configuration.d.ts', 'src/routeTree.gen.ts', 'tools/oxlint/anti-slop'],
  settings: {
    tailwindcss: {
      entryPoint: 'src/routes/__root.css',
      attributes: ['caretClassName'],
      callees: ['tw'],
    },
  },
  options: {
    typeAware: true,
    typeCheck: true,
    reportUnusedDisableDirectives: 'error',
  },
  categories: {
    correctness: 'error',
    suspicious: 'error',
    pedantic: 'error',
    perf: 'error',
    style: 'error',
    restriction: 'error',
    nursery: 'error',
  },
  rules: {
    'array-callback-return': ['error', { checkForEach: true }],
    curly: ['error', 'multi-line'],
    'func-style': ['error', 'expression', { allowArrowFunctions: true }],
    'no-bitwise': ['error', { allow: ['~'], int32Hint: true }],
    'sort-imports': ['error', { allowSeparatedGroups: true, ignoreDeclarationSort: true }],
    'import/no-unassigned-import': ['error', { allow: ['**/*.css'] }],
    'unicorn/filename-case': ['error', { cases: { camelCase: true, kebabCase: true } }],
    'unicorn/numeric-separators-style': ['error', { onlyIfContainsSeparator: true }],
    'typescript/return-await': ['error', 'error-handling-correctness-only'],
    'typescript/strict-boolean-expressions': ['error', { allowNullableString: true }],
    'react/checked-requires-onchange-or-readonly': ['error', { ignoreMissingProperties: true }],
    'react/jsx-curly-brace-presence': ['error', { propElementValues: 'always' }],

    'no-undef': 'off',
    'no-console': 'off',
    'no-undefined': 'off',
    'unicorn/no-null': 'off',
    'no-ternary': 'off',
    'no-nested-ternary': 'off',
    'oxc/no-async-await': 'off',
    'oxc/no-optional-chaining': 'off',
    'oxc/no-rest-spread-properties': 'off',
    'node/no-top-level-await': 'off',
    // Targets Node's blocking fs calls, which this Workers/browser codebase has
    // none of; it matches any *Sync identifier, so it fires on React's flushSync.
    'node/no-sync': 'off',
    'promise/catch-or-return': 'off',
    'typescript/non-nullable-type-assertion-style': 'off',
    'no-duplicate-imports': 'off',
    'default-case': 'off',
    'typescript/consistent-return': 'off',
    'require-await': 'off',
    'no-implied-eval': 'off',
    'prefer-promise-reject-errors': 'off',
    'require-unicode-regexp': 'off',
    'no-inline-comments': 'off',
    'no-underscore-dangle': 'off',
    // oxfmt lowercases numeric literals and runs last, so this rule's uppercase
    // autofix is undone on every `pnpm lint`.
    'unicorn/number-literal-case': 'off',

    'import/no-default-export': 'off',
    'import/prefer-default-export': 'off',
    'import/no-named-export': 'off',
    'import/group-exports': 'off',
    'import/exports-last': 'off',
    'import/no-anonymous-default-export': 'off',
    'import/extensions': 'off',
    'import/unambiguous': 'off',
    'import/no-relative-parent-imports': 'off',
    'unicorn/no-anonymous-default-export': 'off',

    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': 'off',
    'react/jsx-no-literals': 'off',
    'react/only-export-components': 'off',
    'react/function-component-definition': 'off',
    'react/jsx-max-depth': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-handler-names': 'off',
    'react/no-multi-comp': 'off',
    'react/forbid-component-props': 'off',
    'react/forbid-dom-props': 'off',
    'react/forbid-elements': 'off',

    'react-perf/jsx-no-new-function-as-prop': 'off',
    'react-perf/jsx-no-new-object-as-prop': 'off',
    'react-perf/jsx-no-new-array-as-prop': 'off',
    'react-perf/jsx-no-jsx-as-prop': 'off',

    'typescript/explicit-function-return-type': 'off',
    'typescript/explicit-module-boundary-types': 'off',
    'typescript/explicit-member-accessibility': 'off',
    'typescript/prefer-readonly-parameter-types': 'off',

    'id-length': 'off',
    'id-match': 'off',
    'id-denylist': 'off',
    'no-magic-numbers': 'off',
    'sort-keys': 'off',
    'one-var': 'off',
    'capitalized-comments': 'off',
    'func-names': 'off',
    'init-declarations': 'off',
    'max-params': 'off',
    'max-statements': 'off',
    'max-lines': 'off',
    'max-lines-per-function': 'off',
    complexity: 'off',
    'no-continue': 'off',
    'no-plusplus': 'off',
    'prefer-named-capture-group': 'off',
    'vars-on-top': 'off',
    'import/max-dependencies': 'off',
    'promise/avoid-new': 'off',
    'unicorn/no-nested-ternary': 'off',
    'unicorn/max-nested-calls': 'off',

    // The Workers types in worker-configuration.d.ts merge into the DOM `Element`,
    // and their `append(string | ReadableStream | Response)` overload wins — so the
    // modern spelling this rule wants is the one that does not typecheck here.
    'unicorn/prefer-modern-dom-apis': 'off',

    // ev-* are hooks the @supports/@container rules in the colocated stylesheets
    // select on; they are deliberately not utilities.
    'tailwindcss/no-unknown-classes': ['error', { ignorePrefixes: ['ev-'] }],
    'tailwindcss/no-duplicate-classes': 'error',
    'tailwindcss/no-conflicting-classes': 'error',
    'tailwindcss/no-deprecated-classes': 'error',
    'tailwindcss/no-unnecessary-whitespace': 'error',
    'tailwindcss/no-dark-without-light': 'error',
    'tailwindcss/no-contradicting-variants': 'error',
    'tailwindcss/no-unnecessary-arbitrary-value': 'error',
    'tailwindcss/enforce-canonical': 'error',
    'tailwindcss/enforce-shorthand': 'error',
    'tailwindcss/enforce-consistent-important-position': 'error',
    'tailwindcss/enforce-negative-arbitrary-values': 'error',
    'tailwindcss/enforce-consistent-variable-syntax': 'error',
    'tailwindcss/enforce-physical': 'error',
    'tailwindcss/consistent-variant-order': 'error',
    'tailwindcss/prefer-scale-token': 'error',

    // enforce-physical's exact inverse; with both on, every inline-axis utility
    // is an error under one of them. This site is ja/en, so LTR-only.
    'tailwindcss/enforce-logical': 'off',

    // oxfmt owns class order and wrapping via sortTailwindcss; two sorters would
    // fix each other's output on every run.
    'tailwindcss/enforce-sort-order': 'off',
    'tailwindcss/enforce-consistent-line-wrapping': 'off',

    '@tanstack/router/create-route-property-order': 'error',
    '@tanstack/router/route-param-names': 'error',
    'anti-slop/no-chained-type-assertions': 'error',
    'anti-slop/no-conditional-empty-object-spread': 'error',
    'anti-slop/no-known-value-widening': 'error',
    'anti-slop/no-module-mocking': 'error',
    'anti-slop/no-object-parameters': 'error',
    'anti-slop/no-reflect-apply': 'error',
    'anti-slop/no-reflect-get': 'error',
    'anti-slop/no-runtime-typeof': 'off',
    'anti-slop/no-shape-in-symbol-names': 'error',
    'anti-slop/no-unknown-parameters': 'off',
    'anti-slop/no-unknown-returns': 'error',
    'anti-slop/no-unknown-type-aliases': 'error',
    'anti-slop/no-unsafe-dictionary-type': 'error',
    'anti-slop/no-widen-then-assert': 'error',
    'anti-slop/require-safety-comment-for-type-assertion': 'error',
  },
  overrides: [
    {
      files: ['**/*.test.ts'],
      rules: {
        // The release cap is order-dependent: the rule's `Promise.all` fix run
        // over the limiter's nine reserve/release cycles lands only three
        // reserves, so only three releases count and the cap never engages.
        'no-await-in-loop': 'off',
      },
    },
  ],
});
