---
paths: "**/*.test.ts"
---

# Unit Tests (Node Environment)

Node environment tests for pure functions, server functions, and utilities.

## MSW for HTTP Mocking

**DO**: Use MSW for mocking external HTTP calls

```ts
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.post('https://api.github.com/graphql', () =>
    HttpResponse.json({ data: mockData })
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**DON'T**: Use `vi.mock('fetch')` or mock the entire module

## Miniflare KV Bindings

**DO**: Access KV directly via `env` in Cloudflare Vitest pool

```ts
import { env } from 'cloudflare:test';

test('reads from KV', async () => {
  await env.MY_KV.put('key', JSON.stringify(data));
  const result = await myFunction();
  expect(result).toEqual(data);
});
```

## Server Function Testing

**DO**: Use `runWithStartContext` for TanStack Start server functions

```ts
import { runWithStartContext } from '@tanstack/start-storage-context';

const result = await runWithStartContext({
  getRouter: () => ({}) as any,
  request: new Request('http://localhost/test'),
  startOptions: {},
  contextAfterGlobalMiddlewares: {},
}, () => myServerFn());
```

## Fake Timers

**DO**: Use `vi.useFakeTimers()` freely in Node tests - works correctly

**DON'T**: Forget to restore: `vi.useRealTimers()` in afterEach
