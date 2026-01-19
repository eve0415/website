# Skill & Agent Usage

Use skills silently. Stack all applicable. Ask via AskUserQuestion if ambiguous.

## React Development

- rules-of-react, vercel-react-best-practices → planning/implementing components
- web-design-guidelines → designing UI layout/structure (not React-specific)
- frontend-design:frontend-design → creating UI pages/components

## Browser Interaction

- agent-browser → ALL browser interactions (never use Playwright directly)

## Code Quality

- pr-review-toolkit agents (code-reviewer, silent-failure-hunter, etc.) → after any code change
- feature-dev:code-reviewer → reviewing code for issues
- feature-dev:code-explorer → understanding existing features
- feature-dev:code-architect → designing feature architecture

## GitHub

- GitHub MCP → ALL github.com operations (when available)
- WebFetch fallback → only when MCP unavailable

## Documentation Lookup

- TanStack MCP → TanStack libraries (Start, Router, Query, etc.)
- context7 MCP → other libraries (when available)

## Claude Code

- claude-code-guide agent → questions about Claude Code features (user or self)
