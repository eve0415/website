import type { FC, PropsWithChildren } from 'react';

import { TanStackDevtools } from '@tanstack/react-devtools';
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import rootCss from './__root.css?url';

const RootDocument: FC<PropsWithChildren> = ({ children }) => (
  <html lang='ja'>
    <head>
      <HeadContent />
    </head>
    <body>
      {children}

      {import.meta.env.DEV && (
        <TanStackDevtools
          plugins={[
            {
              name: 'TanStack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      )}

      <Scripts />
    </body>
  </html>
);

export const Route = createRootRoute({
  head: () => ({
    meta: [{ charSet: 'utf8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }, { title: 'eve0415' }],
    links: [{ rel: 'stylesheet', href: rootCss }],
  }),
  component: () => (
    <RootDocument>
      <Outlet />
    </RootDocument>
  ),
});
