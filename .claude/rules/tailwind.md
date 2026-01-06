---
paths: "**/*.tsx, **/*.css"
---

# Tailwind CSS 4 Theming

Applies when using Tailwind CSS 4 with custom design system.

## Defining Design Tokens

**DO**: Define all tokens in `__root.css` using @theme

```css
@theme {
  /* Colors */
  --color-bg-primary: #0a0a0a;
  --color-bg-secondary: #141414;
  --color-text-primary: #fafafa;
  --color-text-muted: #737373;
  --color-accent-primary: #00ff88;

  /* Spacing */
  --spacing-lg: 2rem;
  --spacing-xl: 4rem;

  /* Timing */
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 500ms;
}
```

## Using Tokens in Components

**DO**: Reference tokens as Tailwind utilities

```tsx
// Tokens become utility classes automatically
<div className="bg-bg-primary text-text-primary">
  <span className="text-accent-primary">Highlighted</span>
</div>

// Timing tokens work with transition utilities
<button className="transition-colors duration-normal">
  Click
</button>
```

**DON'T**: Use CSS variables directly in className

```tsx
// WRONG - not how Tailwind 4 works
<div className="[--color-bg-primary]">
```

**DON'T**: Define tokens in component files

```tsx
// WRONG - breaks single source of truth
const Component = () => (
  <style>{`:root { --my-color: red; }`}</style>
);
```

## Why Single File for Tokens

1. **Tailwind 4 scans @theme** - All tokens in one place for JIT compilation
2. **Design system consistency** - Changes propagate everywhere
3. **No cascade conflicts** - Predictable specificity

## Animation Keyframes

**DO**: Define keyframes in `__root.css`, not component files

```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Then use in components:

```tsx
<div className="animate-fade-in-up">
```
