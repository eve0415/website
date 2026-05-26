---
paths: '**/*.test.ts'
---

# Unit Tests (workerd via miniflare)

Tests run inside workerd via `@cloudflare/vitest-pool-workers`. Real Cloudflare bindings (KV, D1) available.

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

Use inline SQL migrations with `env.SKILLS_DB.batch()`. `readD1Migrations` from `@cloudflare/vitest-pool-workers` causes Vite resolution conflicts with TanStack Start.

```ts
const MIGRATIONS = [`CREATE TABLE IF NOT EXISTS ...`, ...];

beforeAll(async () => {
  const statements = MIGRATIONS.map(m => env.SKILLS_DB.prepare(m));
  await env.SKILLS_DB.batch(statements);
});
```

## env Mutation

`env` properties are writable in miniflare. Override bindings per-test via direct assignment:

```ts
(env as Record<string, unknown>).MY_BINDING = mockValue;
```

## vi.mock Limitations

`vi.mock` does NOT intercept workerd-native modules (`cloudflare:email`) or packages inlined by `server.deps.inline = true` (e.g., `mimetext`). Tests requiring these mocks stay in the `unit-node` project with Node stubs.

## Fake Timers

`vi.useFakeTimers()` works in workerd. Always restore: `vi.useRealTimers()` in afterEach.
