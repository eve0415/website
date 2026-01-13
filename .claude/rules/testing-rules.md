---
paths: '**/*.test.ts,**/*.test.tsx,**/*.browser.test.ts,**/*.browser.test.tsx,**/*.stories.tsx'
---

# Testing Rules

Requirements and boundaries for test coverage. For HOW to write tests, see vitest-\*.md files.

## Coverage Requirements

| Code Type            | Test Type     | Rule                                                           |
| -------------------- | ------------- | -------------------------------------------------------------- |
| UI components        | Storybook     | **Every component, no exceptions**                             |
| Hooks (browser APIs) | Browser tests | Required (`useMousePosition`, `useIntersectionObserver`, etc.) |
| Pure logic hooks     | Unit tests    | Acceptable (no browser API dependencies)                       |
| Server functions     | Node tests    | See vitest-unit.md patterns                                    |

## Testing Boundaries

**Strict rule**: Don't test child-specific behaviors in parent component tests.

- Parent stories render real children but ONLY assert parent-specific behavior
- Don't mock children; skip assertions on child behavior
- 1 Storybook file = 1 component file (testability determines extraction)
- Duplicate boundaries cause test parallelism issues (flaky failures)

## Test Colocation

Tests live with their components:

- `ComponentName/component-name.stories.tsx` - Storybook
- `ComponentName/component-name.browser.test.tsx` - Browser tests
- `ComponentName/component-name.test.ts` - Unit tests

See file-organization.md for full colocation rules.
