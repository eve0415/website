# eve0415.net

Personal site. React 19 + TanStack Start on Cloudflare Workers, prerendered to static HTML with an SSR fallback. Bilingual: Japanese is the default and lives at the root, English lives under `/en`.

## The gate

```
pnpm lint    # oxlint --fix && oxfmt — writes files
pnpm build   # must end with "Prerendered 20 pages"
```

Run them as two separate commands and check each exit code. **Never pipe `pnpm lint` into `tail`/`head` before checking its result** — a pipe masks the exit code, and that has hidden real violations here more than once.

There are still no tests. CI (`.github/workflows/ci.yaml`) runs the same tools in check mode rather than fix mode, spelled out as full commands rather than through the scripts above — `pnpm exec oxlint`, `pnpm exec oxfmt --check`, `pnpm exec vite build` — so it never rewrites files, and a formatting-only diff fails it instead of being silently fixed. Run the local gate before claiming anything is done, and say what it printed.

## Type safety

Banned in source, without exception:

- `as` assertions — `as const` is fine
- `any`
- `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`
- non-null assertions (`x!`)
- every lint-disable comment (`oxlint-disable`, `eslint-disable`, …)

Reading off `unknown` or a wide value is `typeof` + `in` + equality narrowing. After `typeof v === 'object' && v !== null && 'k' in v`, read `v.k` directly — no cast. If a type is genuinely hard, write a user-defined type guard. If you still cannot type it, stop and say so rather than casting.

## Linting

oxlint runs every category at `error`, plus three plugin sets: `@tanstack/eslint-plugin-router`, `oxlint-tailwindcss`, and a local `anti-slop` plugin that additionally rejects `Reflect.get`, broad `object`-typed parameters, type assertions without a safety comment, and dictionary/index-signature types.

`typeAware` and `typeCheck` are on, so oxlint reports raw TypeScript diagnostics (`typescript(TS2339)`, `typescript(TS6133)`) across the same files `tsconfig.json` includes. There is deliberately no separate `tsc` step — it caught nothing oxlint missed. (`src/routeTree.gen.ts` is exempt from both: it carries `@ts-nocheck`.)

If a rule fires wrongly, fix it in `oxlint.config.ts` by configuring the rule — never with an inline disable, and never by renaming an identifier to dodge a matcher.

## Styling

Tailwind v4, with a `cn` helper (clsx + tailwind-merge) at `src/lib/cn.ts` (`#lib/cn`) for anything conditional. Design tokens are CSS custom properties defined in `src/routes/__root.css`.

Write the canonical form the linter wants: `text-(--ink-title)` not `text-[var(--ink-title)]`, `size-[6px]` not `w-[6px] h-[6px]`, `transition-opacity` not `transition-[opacity]`. Reach through `var()` for tokens rather than repeating literal values.

A colocated `.css` file is for what utilities cannot express — `@keyframes`, `@starting-style`, `@supports`, `@container`, `::details-content`, `::view-transition-*`, anchor positioning. Those files must be **pure CSS**: a Tailwind at-rule (`@apply`, `@variant`, `@theme`) in a component stylesheet silently compiles to nothing, with exit code 0 and no warning.

Class order is oxfmt's job. Don't hand-sort.

**A class list only gets linted and sorted where the tools are told to look**: `className`, a `cn()` argument, or a `tw()` argument.
A list hoisted into a constant, an object value or an array is invisible to both unless it is wrapped in `tw()` (`src/lib/tw.ts`, `#lib/tw`), which babel strips in `vite.config.ts` — the built output is the bare string, so the marker costs nothing.
`cn` combines and overrides; `tw` marks. A class-valued JSX prop not named `className` needs adding to `attributes` in both configs.

## Layout

**Every directory under `src/routes/` has at most one `-/` child, and everything in that directory that is not a route lives in it.** The router's codegen skips any entry whose name starts with `-`, so `-/` is what keeps non-route files from becoming routes; naming it after its parent (`-about/`, `-links/`) only restates the folder it already sits in.

A route that owns private parts is a folder: `index.tsx` is the route, `-/` is its parts. A route with no private parts stays a single file. `about/index.tsx` and `about/-/lab-card.tsx`, but `projects/cella.tsx` alone.

Inside `-/`, nest by what the thing is, as deep as it needs. A component with children of its own becomes `contact-form/index.tsx` plus siblings; a family of related components with no single parent becomes `-/sky/`. **`index.tsx` is always the component itself, never a re-export barrel** — import from the module that defines the thing.

- Things that change together stay together. A single-consumer module sits beside its consumer; something a route shares with its own children lives in that route's `-/`, and the children import it from there. Styles colocate with their component.
- **A component used across unrelated route families leaves `src/routes/` for `src/components/<name>/index.tsx`**, with its styles and subparts in that same folder. Consumers reach it as `#components/<name>`, so the path stays short however deep they sit — that bare form resolves only because `imports` in `package.json` maps `#*` to `./src/*/index.ts(x)` as well as `./src/*.ts(x)`. Name the folder after the thing, never after its kind — `components/card/`, not `components/surfaces/`.
- No top-level `utils/` / `types/` / `hooks/` classification directories. A generic helper with no domain knowledge goes in `src/lib/` (`#lib/cn`, `#lib/tw`).
- **Turning `x.tsx` into `x/index.tsx` changes the route id**, because an index route carries a trailing slash: `createFileRoute('/{-$locale}/about')` becomes `createFileRoute('/{-$locale}/about/')`. The URL does not change — `projects/index.tsx` already serves `/projects` with no trailing slash. Get the string wrong and the build still prerenders a page, at the wrong path.

## Things that bite

- **Prerendering is not automatic.** `vite.config.ts` sets `autoStaticPathsDiscovery: false` and `crawlLinks: false`, so a new route needs an explicit entry in the `pages` array — in both locales — or it silently never prerenders, and `failOnError` will not catch the omission.
- **Everything is prerendered then hydrated.** No `Math.random()`, `Date.now()`, `new Date()`, or `window`/`navigator`/`matchMedia` reads during render — they produce hydration mismatches. A seeded PRNG is already used for decorative randomness; reuse it.
- **The prerendered HTML is one enormous line**, so `grep` treats it as binary. Use `grep -a` when inspecting `dist/client/`.
- Determine a library's behaviour from its type declarations or its shipped `src/` — never from bundled `dist/*.js`.

## Conventions

- Conventional commits, small and one concern each. Commit the lock file alongside any dependency change.
- Dependencies are exact-pinned. Use `pnpm add -E`.
- Secrets live in `.dev.vars` (gitignored) and are typed by `pnpm generate` (`wrangler types`). `.dev.vars.example` is the same keys with no values, committed so CI — which has no `.dev.vars` — can type `Env` from it via `--env-file`. **A new secret goes in both**: leave it out of the example and everything passes locally while CI fails on an untyped `env` read. Never print, log, or commit a secret value.
- Dependencies update weekly through `.github/workflows/update.yaml` (`pnpm/update`), which runs the full gate before it opens a PR.
- Japanese copy is です・ます調, personal and lightly playful, no emoji and no `!`. Both locales are authored, never machine-translated at runtime; copy lives in `src/i18n/copy.ts`.
