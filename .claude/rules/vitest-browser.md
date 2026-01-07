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

## Fake Timers

**DON'T**: Use `vi.useFakeTimers()` in browser tests - doesn't work reliably with Cloudflare bindings and requestAnimationFrame

**DO**: Use real timers with await

```ts
await new Promise(resolve => setTimeout(resolve, 150));
```

## Functions with `this` Parameter

**DO**: Use `.call()` to invoke functions with TypeScript `this` parameter

```ts
type Handler = (this: MediaQueryList, ev: Event) => void;
let handler: Handler | null = null;

// Invoke with correct `this` context
handler!.call(mockMediaQuery, new Event('change'));
```

**DON'T**: Call directly - TypeScript will complain about argument count
