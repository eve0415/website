---
paths: src/routes/**/*
---

# TanStack Router Conventions

## Critical Gotcha: Root Route Path

**DON'T**: Place root route at `routes/index/index.tsx`

```
src/routes/
├── index/
│   └── index.tsx       # WRONG - creates /index/ path, not /
```

**DO**: Place root route directly at `routes/index.tsx`

```
src/routes/
├── index.tsx           # Correct - creates / path
├── projects/
│   └── index.tsx       # /projects
```

**WHY**: TanStack Router interprets directory structure literally. `routes/index/index.tsx` becomes `/index/` not `/`. This caused significant debugging time.

## Non-Route Directories

**DO**: Prefix with `-` to exclude from routing

```
src/routes/
├── index.tsx
├── -_index/              # Colocated with index route, ignored by router
│   ├── Background/       # Component directory with colocated hooks
│   │   ├── Background.tsx
│   │   └── useMousePosition.ts
│   └── Logo.tsx          # Self-contained component
├── projects/
│   ├── index.tsx
│   └── -components/      # Route-specific, not a route
```

**WHY**: TanStack Router auto-generates routes from file structure. Files in `-` prefixed directories are invisible to the router.

## Dynamic Routes

**DO**: Use `$param` syntax for dynamic segments

```tsx
// src/routes/projects/$projectId.tsx
export const Route = createFileRoute("/projects/$projectId")({
  component: ProjectPage,
  loader: async ({ params }) => {
    return fetchProject(params.projectId);
  },
});
```

## Nested Layouts

**DO**: Use `__root.tsx` for layouts

```
src/routes/
├── __root.tsx            # Root layout wraps all routes
├── projects/
│   ├── __layout.tsx      # Layout for /projects/* routes
│   └── index.tsx
```

## Route Export Pattern

**DO**: Always export Route constant with trailing slash in path

```tsx
export const Route = createFileRoute("/projects/")({
  component: ProjectsPage,
});
```

## Loader Error Handling

**DO**: Handle errors in loaders, don't let them propagate silently

```tsx
export const Route = createFileRoute("/projects/")({
  loader: async () => {
    try {
      return await fetchProjects();
    } catch (error) {
      throw new Error("Failed to load projects");
    }
  },
  errorComponent: ({ error }) => <div>Error: {error.message}</div>,
});
```
