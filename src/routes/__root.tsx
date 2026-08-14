import type { FC, PropsWithChildren } from 'react';

import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router';

import rootCss from './__root.css?url';

const RootDocument: FC<PropsWithChildren> = ({ children }) => (
  <html lang='ja'>
    <head>
      <HeadContent />
    </head>
    <body>
      {children}
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
