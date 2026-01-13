---
paths: '**/*.browser.test.ts,**/*.browser.test.tsx'
---

# Browser Tests (vitest-browser-react)

Tests that need real browser APIs using vitest-browser-react.

## Render Import

**DO**: Import `render` directly from 'vitest-browser-react'

```ts
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

test('renders', async () => {
  await render(<MyComponent />);
  await expect.element(page.getByTestId('result')).toHaveTextContent('expected');
});
```

**DON'T**: Use `page.render()` - it doesn't exist

## Cleanup

**DO**: Use `screen.unmount()` for cleanup

```ts
const screen = await render(<Component />);
await screen.unmount();
```

**DON'T**: Use `screen.cleanup()` - method doesn't exist

## Locators API

**DO**: Use `page.getByTestId()` from 'vitest/browser' for queries

```ts
import { page } from 'vitest/browser';

await expect.element(page.getByTestId('result')).toHaveTextContent('value');
```

**DON'T**: Use `screen.getByTestId()` pattern from Testing Library

## Async Assertions

**DO**: Use `await expect.element()` for DOM assertions - it has built-in polling

```ts
// Retries until element has expected content or times out
await expect.element(page.getByTestId('result')).toHaveTextContent('done');
await expect.element(page.getByRole('button')).toBeVisible();
```

**DO**: Use `expect.poll()` for non-DOM assertions with timeout

```ts
// Poll a function until assertion passes
await expect.poll(() => mockFn.mock.calls.length, { interval: 50, timeout: 500 }).toBe(1);
```

**DON'T**: Use `sleep()` or `Promise + setTimeout` patterns

```ts
// WRONG - flaky, no retry logic
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
await sleep(500);
await expect.element(page.getByTestId('result')).toHaveTextContent('done');
```

## Fake Timers

**DO**: Use `vi.useFakeTimers()` when testing time-dependent behavior

```ts
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test('debounce waits 300ms', async () => {
  // Trigger debounced action
  await userEvent.type(input, 'test');

  // Fast-forward time
  await vi.advanceTimersByTimeAsync(300);

  // Assert result
  expect(callback).toHaveBeenCalled();
});
```

**LIMITATIONS**: Fake timers may not work with:

- CSS transitions/animations
- `requestAnimationFrame`-based code
- Some third-party libraries

For these edge cases, redesign the test to assert final state rather than intermediate timing.

## Functions with `this` Parameter

**DO**: Use `.call()` to invoke functions with TypeScript `this` parameter

```ts
type Handler = (this: MediaQueryList, ev: Event) => void;
let handler: Handler | null = null;

// Invoke with correct `this` context
handler!.call(mockMediaQuery, new Event('change'));
```

**DON'T**: Call directly - TypeScript will complain about argument count
