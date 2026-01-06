# Cloudflare Workers Runtime

TanStack Start SSR on Cloudflare Workers edge runtime.

## Environment Access

**DO**: Import `env` from cloudflare:workers in server code

```tsx
import { env } from 'cloudflare:workers';

// Inside createServerFn handler
const kv = env.GITHUB_STATS_CACHE;
const secret = env.GITHUB_PAT;
```

**DON'T**: Import env in client components

```tsx
// WRONG - will crash at runtime
// Client components cannot access Cloudflare bindings
import { env } from 'cloudflare:workers';

const ClientComponent = () => {
  const data = env.MY_KV; // ❌ Runtime error
};
```

**DON'T**: Use process.env

```tsx
// WRONG - Node.js API, not available
const key = process.env.API_KEY;
```

## Server Function Pattern

Server functions encapsulate all env access. Loaders just call them.

```tsx
// -utils/my-api.ts
import { env } from 'cloudflare:workers';
import { createServerFn } from '@tanstack/react-start';

export const fetchData = createServerFn().handler(async () => {
  const kv = env.MY_CACHE;
  return await kv.get('key', 'json');
});

// index.tsx
export const Route = createFileRoute('/my-route/')({
  component: MyPage,
  loader: () => fetchData(), // No context param needed
});
```

## KV Namespace Usage

```tsx
const kv = env.MY_KV_NAMESPACE;

// Read with type
const cached = await kv.get<MyData>('cache-key', 'json');

// Write with TTL (seconds)
await kv.put('cache-key', JSON.stringify(data), {
  expirationTtl: 3600, // 1 hour
});

// Check existence before expensive operations
if (!cached) {
  const fresh = await expensiveFetch();
  await kv.put('cache-key', JSON.stringify(fresh), { expirationTtl: 3600 });
  return fresh;
}
return cached;
```

## Secrets

Use wrangler CLI for sensitive values (not vars in wrangler.json):

```bash
wrangler secret put GITHUB_PAT
```

Access same as other bindings: `env.GITHUB_PAT`

## Runtime Constraints

**CPU time**: 30 seconds max (paid tier)

**DON'T**: Node.js-specific APIs

- `fs`, `path`, `child_process` - not available
- `Buffer` - use `Uint8Array`
- `setInterval` for polling - use scheduled workers

**DO**: Web Standard APIs

- `fetch`, `Request`, `Response`
- `crypto.subtle` for cryptography
- `TextEncoder`/`TextDecoder`
- `caches` API for response caching

## State Between Requests

**DON'T**: Assume module-level state persists

```tsx
// WRONG - resets on cold start
let cache = {};
```

**DO**: Use KV for persistence

```tsx
await env.MY_KV.put(key, value);
```
