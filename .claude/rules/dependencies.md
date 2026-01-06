# Dependency Management Rules

This project deploys to Cloudflare Workers. All code is bundled and minified at build time.

## Core Rule

**All dependencies must be in `devDependencies`** - no runtime dependencies exist.

```bash
pnpm add -D <package-name>
```

## peerDependencies

When a package requires peer dependencies, install them as `devDependencies` as well.

## Versioning

Caret (`^`) ranges are acceptable. The `pnpm-lock.yaml` ensures reproducible builds.

## Packages to Avoid

- **Polyfills**: Workers runtime is modern (ES2022+), polyfills add unnecessary bloat
- **Node.js-specific packages**: Packages relying on `fs`, `path`, `child_process`, `net`, etc. won't work in Workers

## Compatibility

Don't require upfront verification for packages claiming "universal" or "isomorphic" support. Add and test - the build will fail if incompatible.

## Cleanup

Remove unused dependencies when noticed. Don't accumulate dead weight.
