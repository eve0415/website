# File Organization

## Colocation Philosophy

Code lives as close as possible to where it's used. This means:

1. **Component-level colocation**: If a hook/utility is used by only one component, it lives in that component's directory
2. **Route-level colocation**: If used by multiple components in one route but not others, it lives at the route level
3. **Shared directories**: Only create `src/hooks/`, `src/lib/`, `src/components/` when code is genuinely used by multiple routes

## Structure

```
src/routes/
├── __root.tsx              # Root layout
├── __root.css              # Global CSS + design tokens
├── index.tsx               # / route
├── -_index/                # Colocated with index route
│   ├── Background/         # Component with its own hooks
│   │   ├── Background.tsx
│   │   ├── useMousePosition.ts
│   │   └── useReducedMotion.ts
│   ├── Logo.tsx            # Self-contained (no directory)
│   ├── TerminalText.tsx    # Self-contained (no directory)
│   ├── useKonamiCode.ts    # Route-level hook
│   └── console-art.ts      # Route-level utility
├── projects/
│   └── index.tsx
├── skills/
│   └── index.tsx
└── link/
    └── index.tsx
```

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
- **Non-route directories**: `-` prefix (`-_index/`)
