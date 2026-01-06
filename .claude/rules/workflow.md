# Workflow Requirements

## Mandatory Lint Check

**ALWAYS run `pnpm lint` after making code changes.**

This catches:

- Biome formatting/linting issues
- oxlint errors (including React Compiler violations)
- oxfmt formatting issues

```bash
pnpm lint
```

The command auto-fixes what it can. If errors remain, fix them before considering the task complete.

## Why This Matters

- React Compiler errors are silent until lint runs
- Build will fail on CI if lint errors exist
- Catching issues early saves debugging time
