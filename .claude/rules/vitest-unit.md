---
paths: '**/*.test.ts'
---

# Unit Tests (workerd via miniflare)

Tests run inside workerd via `@cloudflare/vitest-pool-workers`. Real Cloudflare bindings (KV, D1, Email) and npm packages available — no stubs needed.

## MSW for HTTP Mocking

The cloudflareTest plugin rewrites `msw/node` → `msw/native` automatically. Keep imports as-is.

```ts
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(http.post('https://api.github.com/graphql', () => HttpResponse.json({ data: mockData })));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**DON'T**: Use `vi.mock('fetch')` or mock the entire module

## KV Bindings

Access KV directly via `env` from `cloudflare:workers`:

```ts
import { env } from 'cloudflare:workers';

test('reads from KV', async () => {
  await env.CACHE.put('key', JSON.stringify(data));
  const result = await myFunction();
  expect(result).toEqual(data);
});
```

## D1 Testing

Use inline SQL migrations with `env.SKILLS_DB.batch()`. `readD1Migrations` from `@cloudflare/vitest-pool-workers` imports wrangler which requires `node:process` — unavailable in workerd.

```ts
const MIGRATIONS = [`CREATE TABLE IF NOT EXISTS ...`, ...];

beforeAll(async () => {
  const statements = MIGRATIONS.map(m => env.SKILLS_DB.prepare(m));
  await env.SKILLS_DB.batch(statements);
});
```

## Mocking Side-Effectful Bindings

`env` properties are writable in miniflare. Mock bindings that have side effects (e.g., sending emails) via direct assignment:

```ts
const mockSend = vi.fn().mockResolvedValue();
(env as Record<string, unknown>).CONTACT_EMAIL = { send: mockSend };
```

npm packages (mimetext, drizzle-orm, etc.) and `cloudflare:*` modules (cloudflare:email, cloudflare:test) work natively in workerd — don't mock them.

## vi.mock Scope

`vi.mock` works for **local modules** and **aliased modules** (e.g., `@tanstack/react-start/server-entry`). It does NOT intercept npm packages inlined by `server.deps.inline = true`. This is rarely an issue — use real implementations and mock only the side-effectful endpoint (env bindings).

## Fake Timers

`vi.useFakeTimers()` works in workerd. Always restore: `vi.useRealTimers()` in afterEach.
