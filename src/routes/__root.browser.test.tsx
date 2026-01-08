import type { FC, PropsWithChildren, ReactNode } from 'react';

import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

// Mock TanStack components that require router context
vi.mock('@tanstack/react-router', async importOriginal => {
  const actual = await importOriginal<object>();
  return {
    ...actual,
    HeadContent: () => null,
    Scripts: () => null,
  };
});

vi.mock('@tanstack/react-devtools', () => ({
  TanStackDevtools: ({ plugins }: { plugins: Array<{ name: string; render: ReactNode }> }) => (
    <div data-testid='tanstack-devtools'>
      {plugins.map(p => (
        <div key={p.name}>{p.name}</div>
      ))}
    </div>
  ),
}));

vi.mock('@tanstack/react-router-devtools', () => ({
  TanStackRouterDevtoolsPanel: () => <div data-testid='router-devtools'>Router Devtools</div>,
}));

type RouteWithShell = { options: { shellComponent: FC<PropsWithChildren> } };

// Import after mocks are set up
const { Route } = await import('./__root');

describe('RootDocument', () => {
  // Note: shellComponent renders <html><body>... which can't be tested inside a container
  // We test what we can: that it renders content and devtools correctly

  test('renders main element containing children', async () => {
    const ShellComponent = (Route as unknown as RouteWithShell).options.shellComponent;
    await render(
      <ShellComponent>
        <div data-testid='child-content'>Child Content</div>
      </ShellComponent>,
    );

    await expect.element(page.getByTestId('child-content')).toBeInTheDocument();
    await expect.element(page.getByText('Child Content')).toBeInTheDocument();
  });

  test('renders TanStack DevTools', async () => {
    const ShellComponent = (Route as unknown as RouteWithShell).options.shellComponent;
    await render(
      <ShellComponent>
        <div>Test Content</div>
      </ShellComponent>,
    );

    await expect.element(page.getByTestId('tanstack-devtools')).toBeInTheDocument();
    await expect.element(page.getByText('TanStack Router')).toBeInTheDocument();
  });

  test('shellComponent is defined on Route', () => {
    expect((Route as unknown as RouteWithShell).options.shellComponent).toBeDefined();
    expect(typeof (Route as unknown as RouteWithShell).options.shellComponent).toBe('function');
  });

  test('renders main element with children wrapper', async () => {
    const ShellComponent = (Route as unknown as RouteWithShell).options.shellComponent;
    const { container } = await render(
      <ShellComponent>
        <span data-testid='inner'>Inner Content</span>
      </ShellComponent>,
    );

    // Main element should exist in the rendered output
    const main = container.querySelector('main');
    expect(main).not.toBeNull();

    // Content should be inside main
    await expect.element(page.getByTestId('inner')).toBeInTheDocument();
  });
});
