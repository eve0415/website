# File Organization

## Route-Colocated Structure

Components, hooks, and utilities live alongside the routes that use them.

```
src/routes/
├── __root.tsx              # Root layout
├── __root.css              # Global CSS + design tokens
├── index.tsx               # / route
├── -shared/                # Shared across ALL routes
│   ├── -hooks/
│   │   ├── useKonamiCode.ts
│   │   └── useMousePosition.ts
│   └── -lib/
│       └── console-art.ts
├── projects/
│   ├── index.tsx           # /projects route
│   └── -components/        # Used ONLY by projects route
│       └── ProjectCard.tsx
└── skills/
    ├── index.tsx
    └── -components/
```

## Rules

1. **Route-specific code**: Lives in `-components/`, `-hooks/`, `-lib/` under that route
2. **Shared code**: Lives in `routes/-shared/`
3. **Global CSS**: Only in `__root.css`
4. **No separate CSS files**: Tailwind classes only for components

## Naming

- **Directories**: kebab-case with `-` prefix for non-routes
- **Components**: PascalCase (`ProjectCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useKonamiCode.ts`)
- **Utilities**: camelCase (`console-art.ts`)
