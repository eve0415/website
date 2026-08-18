# eve0415.net

Personal site. React 19 + TanStack Start on Cloudflare Workers, prerendered to static HTML with an SSR fallback. Bilingual: Japanese is the default and lives at the root, English lives under `/en`.

## The gate

```
pnpm lint    # oxlint --fix && oxfmt — writes files
pnpm build   # must end with "Prerendered 20 pages"
```

Run them as two separate commands and check each exit code. **Never pipe `pnpm lint` into `tail`/`head` before checking its result** — a pipe masks the exit code, and that has hidden real violations here more than once.

There are no tests and no CI by design. The gate above is the whole gate. Run it before claiming anything is done, and say what it printed.

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

If a rule fires wrongly, fix it in `oxlint.config.ts` by configuring the rule — never with an inline disable, and never by renaming an identifier to dodge a matcher.

## Styling

Tailwind v4, with a `cn` helper (clsx + tailwind-merge) at `src/routes/{-$locale}/-/cn.ts` for anything conditional. Design tokens are CSS custom properties defined in `src/routes/__root.css`.

Write the canonical form the linter wants: `text-(--ink-title)` not `text-[var(--ink-title)]`, `size-[6px]` not `w-[6px] h-[6px]`, `transition-opacity` not `transition-[opacity]`. Reach through `var()` for tokens rather than repeating literal values.

A colocated `.css` file is for what utilities cannot express — `@keyframes`, `@starting-style`, `@supports`, `@container`, `::details-content`, `::view-transition-*`, anchor positioning. Those files must be **pure CSS**: a Tailwind at-rule (`@apply`, `@variant`, `@theme`) in a component stylesheet silently compiles to nothing, with exit code 0 and no warning.

Class order is oxfmt's job. Don't hand-sort.

**A class list only gets linted and sorted where the tools are told to look**: `className`, a `cn()` argument, or a `tw()` argument.
A list hoisted into a constant, an object value or an array is invisible to both unless it is wrapped in `tw()` (`src/routes/-/tw.ts`), which is a no-op at runtime and exists only to be that marker.
`cn` combines and overrides; `tw` marks. A class-valued JSX prop not named `className` needs adding to `attributes` in both configs.

## Layout

**Every directory under `src/routes/` has at most one `-/` child, and everything in that directory that is not a route lives in it.** The router's codegen skips any entry whose name starts with `-`, so `-/` is what keeps non-route files from becoming routes; naming it after its parent (`-about/`, `-links/`) only restates the folder it already sits in.

A route that owns private parts is a folder: `index.tsx` is the route, `-/` is its parts. A route with no private parts stays a single file. `about/index.tsx` and `about/-/lab-card.tsx`, but `projects/cella.tsx` alone.

Inside `-/`, nest by what the thing is, as deep as it needs. A component with children of its own becomes `contact-form/index.tsx` plus siblings; a family of related components becomes `ui/surfaces/`. **`index.tsx` is always the component itself, never a re-export barrel** — import from the module that defines the thing.

- Things that change together stay together. A single-consumer module sits beside its consumer; something used across a subtree goes in the `-/` of the nearest common ancestor, not in a top-level catch-all. Styles colocate with their component.
- No top-level `utils/` / `types/` / `hooks/` classification directories.
- **Turning `x.tsx` into `x/index.tsx` changes the route id**, because an index route carries a trailing slash: `createFileRoute('/{-$locale}/about')` becomes `createFileRoute('/{-$locale}/about/')`. The URL does not change — `projects/index.tsx` already serves `/projects` with no trailing slash. Get the string wrong and the build still prerenders a page, at the wrong path.

## Things that bite

- **Prerendering is not automatic.** `vite.config.ts` sets `autoStaticPathsDiscovery: false` and `crawlLinks: false`, so a new route needs an explicit entry in the `pages` array — in both locales — or it silently never prerenders, and `failOnError` will not catch the omission.
- **Everything is prerendered then hydrated.** No `Math.random()`, `Date.now()`, `new Date()`, or `window`/`navigator`/`matchMedia` reads during render — they produce hydration mismatches. A seeded PRNG is already used for decorative randomness; reuse it.
- **The prerendered HTML is one enormous line**, so `grep` treats it as binary. Use `grep -a` when inspecting `dist/client/`.
- Determine a library's behaviour from its type declarations or its shipped `src/` — never from bundled `dist/*.js`.

## Conventions

- Conventional commits, small and one concern each. Commit the lock file alongside any dependency change.
- Dependencies are exact-pinned. Use `pnpm add -E`.
- Secrets live in `.dev.vars` (gitignored) and are typed by `pnpm generate` (`wrangler types`). Never print, log, or commit a secret value.
- Japanese copy is です・ます調, personal and lightly playful, no emoji and no `!`. Both locales are authored, never machine-translated at runtime; copy lives in `src/i18n/copy.ts`.
