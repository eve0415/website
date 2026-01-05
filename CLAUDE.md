# Instructions / Guidance for AI Agents

This file provides guidance to AI when working with code in this repository.

Read .claude/CLAUDE.md too.

## Project Overview

Personal website (eve0415.net) built with TanStack Start, React 19, and deployed to Cloudflare Workers.

## Commands

```bash
pnpm dev          # Start dev server with hot reload
pnpm build        # Production build
pnpm lint         # Run Biome + oxlint + oxfmt (auto-fixes enabled)
pnpm generate     # Generate Cloudflare Worker types
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

- Node.js 24.12.x (see `.node-version`)
- pnpm 10.x package manager
