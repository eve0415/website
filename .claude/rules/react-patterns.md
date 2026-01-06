---
paths: "**/*.tsx"
---

# React Component Syntax

This rule covers syntax patterns NOT enforced by oxlint or the `/rules-of-react` skill.

## Component Type Annotation

**DO**: Use FC type with arrow functions

```tsx
import type { FC } from 'react';

const MyComponent: FC = () => {
  return <div />;
};
```

**DON'T**: Use function declarations or omit FC type

```tsx
// Wrong - function declaration
function MyComponent() { return <div />; }

// Wrong - no FC type
const MyComponent = () => { return <div />; };
```

**WHY**: FC provides type-safe props and consistent signatures. Arrow functions with explicit FC type are the project standard.

## Export Style

**DO**: Use default export at the end of file

```tsx
const MyComponent: FC = () => <div />;

export default MyComponent;
```

**DON'T**: Use named exports or inline default

```tsx
// Wrong - named export
export const MyComponent: FC = () => {};

// Wrong - inline default (can't add FC type)
export default function MyComponent() {}
```

**WHY**: Default exports enable cleaner imports and work with React lazy loading. Named exports create inconsistent import patterns.

---

**Note**: This rule does NOT cover:
- Component purity (see `/rules-of-react` skill)
- Hook rules (see `/rules-of-react` skill)
- State management (see `/rules-of-react` skill)
- Props validation (see `/rules-of-react` skill)
