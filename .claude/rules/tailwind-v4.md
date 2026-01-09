# Tailwind CSS 4.1 Changes

## Gradient Utilities

In Tailwind CSS 4.1, gradient utilities use new canonical class names:

| Old (3.x)           | New (4.1)         |
| ------------------- | ----------------- |
| `bg-gradient-to-r`  | `bg-linear-to-r`  |
| `bg-gradient-to-l`  | `bg-linear-to-l`  |
| `bg-gradient-to-t`  | `bg-linear-to-t`  |
| `bg-gradient-to-b`  | `bg-linear-to-b`  |
| `bg-gradient-to-tr` | `bg-linear-to-tr` |
| `bg-gradient-to-tl` | `bg-linear-to-tl` |
| `bg-gradient-to-br` | `bg-linear-to-br` |
| `bg-gradient-to-bl` | `bg-linear-to-bl` |

**DO**: Use the new `bg-linear-to-*` syntax

```tsx
<div className='bg-linear-to-r from-cyan to-neon' />
```

**DON'T**: Use the old `bg-gradient-to-*` syntax

```tsx
// Old syntax - still works but not canonical
<div className='bg-gradient-to-r from-cyan to-neon' />
```

The linter will suggest converting `bg-gradient-to-*` to `bg-linear-to-*`.
