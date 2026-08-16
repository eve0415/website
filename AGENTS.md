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

Tailwind v4, with a `cn` helper (clsx + tailwind-merge) at `src/routes/{-$locale}/-ui/cn.ts` for anything conditional. Design tokens are CSS custom properties defined in `src/routes/__root.css`.

Write the canonical form the linter wants: `text-(--ink-title)` not `text-[var(--ink-title)]`, `size-[6px]` not `w-[6px] h-[6px]`, `transition-opacity` not `transition-[opacity]`. Reach through `var()` for tokens rather than repeating literal values.

A colocated `.css` file is for what utilities cannot express — `@keyframes`, `@starting-style`, `@supports`, `@container`, `::details-content`, `::view-transition-*`, anchor positioning. Those files must be **pure CSS**: a Tailwind at-rule (`@apply`, `@variant`, `@theme`) in a component stylesheet silently compiles to nothing, with exit code 0 and no warning.

Class order is oxfmt's job. Don't hand-sort.

## Layout

- Things that change together stay together. A single-consumer module sits beside its consumer; something used across a subtree goes at the nearest common ancestor, not in a top-level catch-all. Styles colocate with their component.
- No `index.ts` barrel files — import from the source module.
- No top-level `utils/` / `types/` / `hooks/` classification directories.
- **Non-route files under `src/routes/` must live in a `-`-prefixed directory** (`-ui/`, `-site/`, `-home/`, …) or the router's codegen turns them into routes.

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
