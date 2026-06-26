# Instructions / Guidance for AI Agents

This file provides guidance to AI when working with code in this repository.

Read .claude/CLAUDE.md too.

## Project Overview

Personal website (eve0415.net) built with TanStack Start, React 19, and deployed to Cloudflare Workers.

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # oxlint + oxfmt (auto-fixes)
pnpm test             # Run all tests
pnpm vitest run <path>  # Run specific test
pnpm generate         # Generate Worker types, GraphQL types, D1 migrations
pnpm migrate          # Apply D1 migrations locally
pnpm storybook        # Start Storybook
```

## Architecture

- **Framework**: TanStack Start with SSR enabled
- **Routing**: File-based routing via TanStack Router - routes auto-generated from `src/routes/`
- **Deployment**: Cloudflare Workers (configured in `wrangler.json`)
- **Styling**: Tailwind CSS 4 with automatic class sorting

### Key Files

- `src/routes/__root.tsx` - Root layout component
- `src/router.tsx` - Router configuration
- `src/routeTree.gen.ts` - Auto-generated route tree (do not edit manually)

## Code Style

- **TypeScript**: Extremely strict configuration (no unchecked index access, exact optional properties)
- **Formatting**: oxfmt with 160-char line width, single quotes
- **Imports**: Consistent type imports enforced (`import type { }` syntax)
- **Tailwind**: Classes are auto-sorted by tooling

## Requirements

- Node.js 24.18.x (see `devEngines` in `package.json`)
- pnpm 11.x package manager (see `packageManager` in `package.json`)

## Language Requirements

- **UI Text**: Japanese only (html lang="ja")
- **Code/Comments**: English only
- **Variable/Function Names**: English only

This is strictly enforced. User-facing strings must be Japanese. Technical content must be English.

**Exception**: The retro-terminal, BSOD, and 404-boot screens deliberately use English as a stylistic choice to sell their authentic system-UI aesthetic.

## Rules Philosophy

Rules in `.claude/rules/` focus on:

- Runtime constraints that cause failures
- Framework gotchas that cost debugging time
- Project-specific integration patterns

Rules do NOT cover:

- Code style (use oxlint/oxfmt)
- React best practices (use `/rules-of-react` skill)
- Generic programming guidance
