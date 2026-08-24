# eve0415.net

Personal site. React 19 + TanStack Start on Cloudflare Workers, prerendered to static HTML with an SSR fallback. Bilingual: Japanese is the default and lives at the root, English lives under `/en`.

## The gate

```
pnpm lint    # oxlint --fix && oxfmt — writes files
pnpm build   # must end with "Prerendered 20 pages"
pnpm test    # vitest run, both projects
```

Run them as three separate commands and check each exit code. **Never pipe `pnpm lint` into `tail`/`head` before checking its result** — a pipe masks the exit code, and that has hidden real violations here more than once.

CI (`.github/workflows/ci.yaml`) runs the same tools in check mode rather than fix mode, spelled out as full commands rather than through the scripts above — `pnpm exec oxlint`, `pnpm exec oxfmt --check`, `pnpm exec vite build`, `pnpm exec vitest run` — so it never rewrites files, and a formatting-only diff fails it instead of being silently fixed. The build runs before the tests, there and here, because the `dist` project reads what it writes; that costs the fail-fast of testing first. Run the local gate before claiming anything is done, and say what it printed.

## Tests

Two vitest projects, declared under `test.projects` in `vitest.config.ts`. **`coverage` and `sequence` are read from the root config and nowhere else** — a project carrying either is ignored in silence, and `sequence.shuffle` spent five commits switched off that way before a review caught it. Everything else is per-project and is not inherited, so both entries spread the same shared block.

### `worker`

Twelve colocated `.test.ts` files, 308 tests, across four directories plus `src/security-headers.ts` at the root, none of which render a component:

- `src/routes/{-$locale}/links/-/contact-form/` — `rate-limit-key`, `validation`, `form-state`, the `ContactRateLimiter` Durable Object, and `turnstile/verify`, whose whole decision table runs through the one exported function against a stubbed global `fetch`.
- `src/i18n/` — `locale` and `head`, where the traps are documented in the source and none of them are typed: the `/en` prefix that must not match `/english`, the English root that must not gain a trailing slash, and the self-referential canonical and hreflang cluster.
- `src/routes/{-$locale}/-/sky/` — `seeded-random`, `puffs`, and `palette`, all of it about the prerender surviving hydration: the same seed giving the same sequence with no clock read, identical arguments giving deep-equal puffs, and `MIDNIGHT`'s rule text recomputing on the client exactly as prerendered, plus the clock being read modulo 24 with a non-finite value falling back to midnight.
- `src/lib/` — `cn`, a table of which of two conflicting Tailwind classes survives.
- `src/security-headers.ts` — the dev/prod `'unsafe-eval'` split, Turnstile's origin in both `script-src` and `frame-src`, and no duplicate header names.

Everything else is untested, and some of it deliberately. `send-contact.ts` has no supported way to invoke a `createServerFn` handler (<https://github.com/TanStack/router/issues/7507>). `turnstile/size.ts` and `lib/prefers-reduced-motion.ts` both read `globalThis.matchMedia`, which workerd does not have, and standing up a partial `MediaQueryList` would cost more than either one-line wrapper is worth. The components need a DOM, which this pool has none of. `i18n/copy.ts` and `-/site/header-classes.ts` are left alone on purpose: `satisfies` already enforces copy's structure and `tw()` already puts the header's three class lists in front of oxlint and oxfmt, and assertions on editorial prose or on static class strings would only obstruct legitimate edits. The `dist` project reads the header's three lists as needles, but asserts nothing about what they say.

Everything runs in workerd through `@cloudflare/vitest-plugin`, which is a plain Vite plugin in `vitest.config.ts` and takes its bindings from `wrangler.json`. miniflare stands every one of them up locally, including `send_email` and `version_metadata` — but `CONTACT_EMAIL` arrives as a plain `Fetcher` stand-in, so nothing is actually delivered and there is no sent mail to assert on. `test.globals` is off, so each file imports `describe`/`it`/`expect` from `vitest`.

- **`main` is overridden** to the rate-limiter module. Pointed at `wrangler.json`'s own `main`, the pool tries to bundle `src/server.ts`, whose re-export of TanStack Start's server entry needs the `#tanstack-router-entry` subpath that only the `tanstackStart` Vite plugin supplies. That module has no default export, so `SELF` and `exports.default.fetch()` have nothing to reach — a test that wants to drive the app through a request needs a different entry.
- **`.dev.vars` is not what CI runs on.** `ci.yaml` passes `.dev.vars.example` to `wrangler types` and nothing else, so the secret names are typed but never bound: a test that reads `env.TURNSTILE_SECRET_KEY` gets a real value locally and `undefined` in CI, which becomes the string `'undefined'` in any string position and so compares equal to every other absent binding. `vitest.config.ts` binds a fake through `miniflare.bindings`, which wins over `.dev.vars` even where that file exists, so both environments read the same value and a test can assert on it outright. Assert the literal, never `env` — an expectation read from the same binding it is checking passes on two `undefined`s.
- **Storage is isolated per test _file_, not per test**, and the files run concurrently. Every Durable Object test takes its own object name; share one and the suite passes in declaration order and fails under `sequence.shuffle`, which is on.
- **Fake timers do reach `Date.now()` inside the object**, so the window and `alarm()` are testable. Set the clock _ahead_ of the real one — pinned to a past instant, `setAlarm(now + WINDOW_MS)` is already due and miniflare fires it before `runDurableObjectAlarm` can.
- **Coverage is Istanbul**, because V8's native coverage does not work in workerd. There is no global threshold — the repo would only fail or lie — but every tested module sits behind a `{ 100: true }` glob with `perFile` and hits 100% on all four metrics, so none of them can quietly lose coverage. Those thresholds are keyed by glob, and **a glob that matches nothing passes**: renaming a tested file, or a directory holding one, silently turns its 100% guarantee into a no-op. A more specific key does not override a broader one either — vitest applies every pattern that matches — so the globs stay enumerated rather than wildcarded. Move a file, update `vitest.config.ts`.
- **Two of those 100%s are asserted rather than earned.** `palette.ts` and `rate-limit-key.ts` each carry an `/* istanbul ignore next */` over a guard that `noUncheckedIndexedAccess` demands but that cannot fire — the index is bounded by a module constant, and the regex has already matched the four groups being read. No test reaches either line.
- **Coverage is not the measure.** Every gap found here so far sat behind a green 100%: reserve atomicity, the ReDoS ordering, the release cap surviving eviction, the rolling window, and the length ceilings. Mutate the source and check the suite goes red; that is what says a test pins anything.

### `dist`

Five files under `test/dist/`, 74 tests, over what `vite build` wrote: the `tw()` markers being gone from the client bundle, the 20 prerendered pages and each one's canonical, hreflang cluster and non-empty title, `sitemap.xml` down to its own hreflang cluster, and `_headers`. Plain node, no cloudflare plugin — workerd has no `node:fs`, which is the whole reason this is a second project.

- **The build has to have happened.** `test/dist/client-output.ts` throws at import if `dist/client` is missing, rather than skipping: a suite reporting zero tests is the one failure these cannot see. Nothing here shells out to run a build. For the same reason `head.test.ts` reads each page inside its `it`s rather than in the `describe.each` body — a page missing from `dist/` throws, and thrown during collection that turns its 60 tests into none rather than into 20 red ones.
- **`test/dist/` is not the build output**, but three ignore lists thought it was. `.gitignore`, `oxlint.config.ts` and `oxfmt.config.ts` all carried a bare `dist` pattern, which matches the directory at any depth — the files were untracked, unlinted and unformatted, and `oxfmt --check` exits 0 when everything it was given is excluded. All three are anchored to `/dist` now. Vitest's default `exclude` is only `node_modules` and `.git` as of 4.x, so `include` alone is enough — an `exclude` override here would drop `.git` rather than add anything. CI lints before it builds, so `dist/` is not there when the linters run: only a local gate, with a build already behind it, exercises the anchoring at all.
- **Nothing asserts on the name `tw`.** The client bundle is minified, so `tw` is mangled long before a test looks at it and no build reaches `dist/client` with the name intact — with `stripTw` removed, `grep -a 'tw('` finds nothing across all 20 chunks. An assertion on it passed unconditionally and read as coverage, so it is gone. What does change is the class list itself: stripped, it ships as a bare string literal; left alone, it ships as the argument of a call, and one bare identity binding (`Oe=e=>e`) turns up in the shared chunk. Those four are what go red, and the identity one is name-blind by necessity — a dependency shipping its own `x => x` would fail it with nothing wrong here.
- **React renders the property, so the attribute is `hrefLang`.** A `/hreflang=/` regex matches zero. Head assertions are scoped to `<head>` because the body carries `<a hrefLang>` links of its own.
- **The expected paths and URLs are transcribed, not computed.** `test/dist/client-output.ts` carries a literal table of the 20 served files and their full `https://eve0415.net/…` URLs, `SITE_URL` spelled out along with them. Derived instead — the build lays the paths out through `localePath` and writes every canonical through `canonicalUrl`, which is `SITE_URL` plus that same `localePath` — both sides of every canonical, hreflang and `<loc>` assertion move together: pointing `SITE_URL` at `https://example.com` rewrote every URL in `dist/` and all 75 tests still passed. Deriving it also made this project a second execution of `localePath` across every branch, which held `src/i18n/locale.ts` at a merged 100% with the worker suite's `localePath` tests deleted. The table costs a second edit per new route, alongside `ROUTE_SET` in `vite.config.ts`, and buys assertions that can fail. It does not hand `locale.ts` its coverage back, though: delete the worker suite's `localePath` block today and the file is still at 100% and the run still green. `src/i18n/head.test.ts`'s `canonicalUrl` cases drive every branch of `localePath` against literal URLs — that file alone puts `locale.ts` at 25% functions and 28.57% branches, which is `localePath` entirely and nothing else in the module. That was already true before this table existed, so the `dist` project was a third redundant holder rather than the one propping the threshold up, and no glob here is load-bearing on one test.
- `_headers` is asserted as literal directives. Reading it back from `securityHeaders(false)` would compare the generator to itself and pass on any policy at all.

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
A list hoisted into a constant, an object value or an array is invisible to both unless it is wrapped in `tw()` (`src/lib/tw.ts`, `#lib/tw`), which the `stripTw` plugin in `vite.config.ts` removes — the built output is the bare string, so the marker costs nothing. Being an identity function does not make it free on its own: oxc's minifier does not inline across chunks.
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
- **The prerendered HTML carries NUL bytes**, inside TanStack's serialized route ids (`i:"__root__\0"`, eight of them in `about.html`), so `grep` treats it as binary. It is also one enormous line, but that alone greps fine. Use `grep -a` when inspecting `dist/client/`.
- **A new Durable Object migration cannot ship through a branch build.** Cloudflare Workers Builds deploys non-production branches with `wrangler versions upload`, and the API refuses any version whose config carries an unapplied migration (`code: 10211`) — lifecycle changes land only through a non-versioned `wrangler deploy`. So `ContactRateLimiter`'s `v1` has to reach production once before a preview upload of a branch that declares it can succeed, and a Worker that implements a Durable Object stops getting Preview URLs at all.
- Determine a library's behaviour from its type declarations or its shipped `src/` — never from bundled `dist/*.js`.

## Conventions

- Conventional commits, small and one concern each. Commit the lock file alongside any dependency change.
- Dependencies are exact-pinned. Use `pnpm add -E`.
- Secrets live in `.dev.vars` (gitignored) and are typed by `pnpm generate` (`wrangler types`). `.dev.vars.example` is the same keys with no values, committed so CI — which has no `.dev.vars` — can type `Env` from it via `--env-file`. **A new secret goes in both**: leave it out of the example and everything passes locally while CI fails on an untyped `env` read. Never print, log, or commit a secret value.
- Dependencies update weekly through `.github/workflows/update.yaml` (`pnpm/update`), which runs the full gate before it opens a PR.
- GitHub Actions are Dependabot's, in `.github/dependabot.yaml`. They are pinned to commit SHAs with the tag in a trailing comment; that comment is how Dependabot knows which version a SHA is, so keep it when you change a pin.
- Japanese copy is です・ます調, personal and lightly playful, no emoji and no `!`. Both locales are authored, never machine-translated at runtime; copy lives in `src/i18n/copy.ts`.
