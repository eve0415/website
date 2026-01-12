# Copilot PR Review Instructions

## Stack

- **Runtime**: Cloudflare Workers (edge, not Node.js)
- **Framework**: TanStack Start with SSR
- **UI**: React 19 with React Compiler
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript (strict mode)

## Key Constraints

- No Node.js APIs (fs, path, Buffer, process.env) - Workers runtime
- Use `cloudflare:workers` for env access in server code only
- 30-second CPU time limit on Workers
- All dependencies are devDependencies (bundled at build)

## Philosophy

- Avoid over-engineering - minimal changes for the task
- Colocation preferred - code lives near where it's used
- No premature abstractions

## Do NOT Comment On

- Code style or formatting (handled by Biome, oxlint, oxfmt)
- React patterns (handled by oxlint-plugin-react-compiler)
- Tailwind class ordering (handled by tooling)

## Review Focus

Only comment when confident about:

- Runtime compatibility issues (Workers-specific)
- Security concerns
- Logical errors or edge cases
- Missing error handling in critical paths
