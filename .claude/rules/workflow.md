# Workflow Requirements

## Mandatory Lint Check

**ALWAYS run `pnpm lint` after ANY file change** - code, markdown, config, everything.

```bash
pnpm lint
```

This catches:

- Biome formatting/linting issues
- oxlint errors (including React Compiler violations)
- oxfmt formatting issues

The command auto-fixes what it can. Trust auto-fixes; no manual review required. If errors remain, fix them before proceeding.

## Why This Matters

- React Compiler errors are silent until lint runs
- Build will fail on CI if lint errors exist
- Catching issues early saves debugging time

## Full Development Cycle

After making changes, follow this complete cycle:

1. **Edit code**
2. **`pnpm lint`** - Run after ANY file change
3. **Create tests** (see testing-rules.md for requirements)
4. **`pnpm lint`** - Run again after adding tests
5. **`pnpm test path/to/specific.test.ts`** - Run specific tests first
6. **`pnpm test`** - Run ALL tests
   - Fix ALL failures, no exceptions (even if "unrelated" to your changes)
