import type { FC, PropsWithChildren } from 'react';

import { TanStackDevtools } from '@tanstack/react-devtools';
import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import BSODError from './-components/BSODError/bsod-error';
import rootCss from './__root.css?url';

const RootDocument: FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang='ja'>
      <head>
        <HeadContent />
      </head>
      <body className='text-foreground bg-background min-h-dvh'>
        <main>{children}</main>

        <Scripts />

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
      </body>
    </html>
  );
};

export const Route = createRootRouteWithContext<{
  cspNonce?: string;
}>()({
  shellComponent: ({ children }) => <RootDocument>{children}</RootDocument>,
  errorComponent: BSODError,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'eve0415',
      },
      {
        name: 'description',
        content: 'eve0415 - エンジニア',
      },
      {
        name: 'theme-color',
        content: '#0a0a0a',
      },
      {
        property: 'og:title',
        content: 'eve0415',
      },
      {
        property: 'og:description',
        content: 'eve0415 - エンジニア',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:url',
        content: 'https://eve0415.net',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:site',
        content: '@eveevekun',
      },
      {
        name: 'apple-mobile-web-app-title',
        content: 'eve0415',
      },
    ],
    links: [
      { rel: 'stylesheet', href: rootCss },
      { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', media: '(prefers-color-scheme: light)' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon-dark.ico', media: '(prefers-color-scheme: dark)' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/site.webmanifest' },
      { rel: 'canonical', href: 'https://eve0415.net' },
    ],
  }),
});
