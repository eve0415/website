# Cloudflare Workers Runtime

This project uses TanStack Start SSR on Cloudflare Workers edge runtime.

## CRITICAL: Execution Time Limits

**WARNING**: Workers have strict CPU time limits:
- Free tier: 50ms CPU time
- Paid tier: up to 30 seconds

**DON'T**: Long synchronous operations

```tsx
// WILL FAIL - exceeds CPU time
const data = heavyComputation(largeDataset);
```

**DO**: Keep operations minimal, use streaming for large responses

```tsx
// Stream SSR response instead of buffering
return new Response(stream, {
  headers: { 'Content-Type': 'text/html' },
});
```

## Accessing Environment Variables

**DON'T**: Use `process.env`

```tsx
// WRONG - Node.js API, not available
const key = process.env.API_KEY;
```

**DO**: Access via context/bindings in handlers

```tsx
// In TanStack Start handler
export default defineEventHandler((event) => {
  const apiKey = event.context.cloudflare.env.API_KEY;
});
```

**DO**: For client components, pass public vars explicitly

```tsx
// In loader - expose only PUBLIC values
export const Route = createFileRoute('/')({
  loader: async ({ context }) => {
    return {
      publicApiUrl: context.env.PUBLIC_API_URL,
      // NEVER: secretKey: context.env.SECRET_KEY
    };
  },
});
```

## Runtime Constraints

**DON'T**: Use Node.js-specific APIs
- `fs`, `path`, `child_process` - not available
- `Buffer` - use `Uint8Array` instead
- `setInterval` for long polling - use scheduled workers

**DO**: Use Web Standard APIs
- `fetch`, `Request`, `Response`
- `crypto.subtle` for cryptography
- `TextEncoder`/`TextDecoder`
- `caches` API for response caching

## State Between Requests

**DON'T**: Assume in-memory state persists

```tsx
// WRONG - state resets between requests
let cache = {};
export function handler() {
  cache[key] = value; // Lost on next cold start
}
```

**DO**: Use KV or Durable Objects for persistence

```tsx
// Correct - use Workers KV
await env.MY_KV.put(key, value);
const cached = await env.MY_KV.get(key);
```

## wrangler.json Configuration

**DO**: Keep configuration explicit

```json
{
  "name": "eve0415-website",
  "main": "dist/_worker.js",
  "compatibility_date": "2024-01-01",
  "vars": {
    "PUBLIC_API_URL": "https://api.example.com"
  }
}
```

**DO**: Use secrets for sensitive values (not vars)

```bash
wrangler secret put API_KEY
```
