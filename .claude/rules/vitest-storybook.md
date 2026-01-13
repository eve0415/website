---
paths: '**/*.stories.tsx'
---

# Storybook Tests (CSF Next)

Component stories with visual testing using CSF Next pattern.

## CSF Next Pattern

**DO**: Use `definePreview` with `preview.meta()` and `meta.story()`

```tsx
import preview from '#.storybook/preview';

const meta = preview.meta({
  component: MyComponent,
  tags: ['autodocs'],
});

export const Default = meta.story({
  args: { prop: 'value' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Expected')).toBeInTheDocument();
  },
});
```

**DON'T**: Use old `Meta<typeof Component>` and `StoryObj` types

## Viewport Testing

**DO**: Use `setViewport()` and `testAllViewports()` from `.storybook/viewports.ts`

```tsx
import { setViewport, testAllViewports } from '#.storybook/viewports';

play: async ({ canvasElement }) => {
  await testAllViewports(canvasElement, async viewport => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button')).toBeVisible();
  });
};
```

## Play Function Imports

**DO**: Import from 'storybook/test', not '@storybook/test'

```tsx
import { expect, waitFor, within } from 'storybook/test';
```

## Async Testing (Play Functions)

**DO**: Use `waitFor()` from `storybook/test` for async assertions

```tsx
import { expect, waitFor, within } from 'storybook/test';

play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Wait for async state with explicit timeout
  await waitFor(() => expect(canvas.getByTestId('progress')).toHaveTextContent('100%'), { timeout: 5000, interval: 100 });
};
```

**DON'T**: Use bare `setTimeout` or `sleep()` patterns

```tsx
// WRONG - flaky, no retry logic
await new Promise(resolve => setTimeout(resolve, 2500));
await expect(canvas.getByTestId('progress')).toHaveTextContent('100%');
```

**WHY**: `waitFor()` retries the assertion until it passes or times out. Bare `setTimeout` waits a fixed time then asserts once - if timing varies, tests fail intermittently.

## Decorators

**DO**: Add background decorators for dark-themed components

```tsx
decorators: [
  Story => (
    <div className='bg-bg-primary p-8'>
      <Story />
    </div>
  ),
],
```

## Multi-Browser Testing

Stories run in Chromium, Firefox, and WebKit automatically via vitest.config.ts storybook project.
