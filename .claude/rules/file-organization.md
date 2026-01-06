# File Organization

## Colocation Philosophy

Code lives as close as possible to where it's used. This means:

1. **Component-level colocation**: If a hook/utility is used by only one component, it lives in that component's directory
2. **Route-level colocation**: If used by multiple components in one route but not others, it lives at the route level
3. **Shared directories**: Only create `src/hooks/`, `src/lib/`, `src/components/` when code is genuinely used by multiple routes

## Colocation by Route Type

### Root Route (Special Case)

The root `index.tsx` has no parent directory, so colocated files use a sibling pattern:

```
src/routes/
├── index.tsx           # / route
├── -index/            # Colocated (legacy naming, kept for compatibility)
│   ├── Background/
│   │   ├── Background.tsx
│   │   └── useMousePosition.ts
│   ├── Logo.tsx
│   └── useKonamiCode.ts
```

### Standard Routes (All Other Routes)

All other routes place colocated files **INSIDE** the route directory:

```
src/routes/
├── sys/
│   ├── index.tsx           # /sys route
│   ├── -components/        # Colocated components
│   │   ├── CodeRadar/
│   │   │   └── CodeRadar.tsx
│   │   └── StatsPanel/
│   │       ├── StatsPanel.tsx
│   │       └── useDecryptAnimation.ts
│   └── -utils/             # Route-level utilities
│       └── github-api.ts
├── projects/
│   └── index.tsx
├── skills/
│   └── index.tsx
└── link/
    └── index.tsx
```

**CRITICAL**: Do NOT create `-_routename/` as a sibling at the `routes/` level. That pattern only applies to the root route because it has no parent directory.

### Why Inside vs Sibling?

- **Inside**: Route owns all its code, clear boundary, easy to find
- **Sibling only for root**: No parent directory exists to nest into

## Prefix Convention

- Use single dash `-` prefix for non-route directories
- Exception: `-index/` kept as legacy (do not rename)
- Examples: `-components/`, `-utils/`, `-hooks/`

## Rules

1. **Single-consumer code**: Lives next to its consumer, not in shared directories
2. **Component directories**: Create `ComponentName/ComponentName.tsx` when component has dedicated hooks/utilities/tests
3. **Self-contained components**: Keep as flat files (no directory) when no colocated files needed
4. **No barrel files**: Avoid `index.ts` re-exports (adds bundle overhead per Vite docs)
5. **No preemptive directories**: Don't create empty placeholder directories
6. **Global CSS**: Only in `__root.css`

## Naming

- **Component directories**: PascalCase (`Background/`)
- **Component files**: PascalCase, same as directory (`Background/Background.tsx`)
- **Hooks**: camelCase with `use` prefix (`useMousePosition.ts`)
- **Utilities**: camelCase (`console-art.ts`)
- **Non-route directories**: Single dash `-` prefix (`-components/`, `-utils/`)

## Shared Code Location

When code is used by multiple routes, move it to shared directories:

```
src/
├── hooks/
│   └── useReducedMotion.ts  # Used by index and sys routes
├── lib/
│   └── utils.ts             # Shared utilities
└── routes/
    └── ...
```

### Import Path Alias

Use `#` prefix to import from `src/`:

```tsx
// Instead of relative paths like ../../../../hooks/useReducedMotion
import { useReducedMotion } from "#hooks/useReducedMotion";
```

Configured in `package.json` (imports) and `tsconfig.json` (paths).
