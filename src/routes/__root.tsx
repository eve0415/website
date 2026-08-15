import type { FC, PropsWithChildren } from 'react';

import { TanStackDevtools } from '@tanstack/react-devtools';
import { HeadContent, Outlet, Scripts, createRootRoute, rootRouteId, useRouteContext } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import { localeFromPathname } from '#i18n/locale';

import rootCss from './__root.css?url';
import { NotFound } from './{-$locale}/-not-found/not-found';

const SITE_URL = 'https://eve0415.net';
const SITE_NAME = 'eve0415';

const RootDocument: FC<PropsWithChildren> = ({ children }) => {
  // Computed in beforeLoad, so this is resolved on the server during SSR rather
  // than derived in the browser. HeadContent only writes into <head>, so lang
  // cannot come from a route's head() and has to be read here.
  const locale = useRouteContext({ from: rootRouteId, select: context => context.locale });

  return (
    <html lang={locale}>
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
};

export const Route = createRootRoute({
  beforeLoad: ({ location }) => ({ locale: localeFromPathname(location.pathname) }),
  head: () => ({
    meta: [
      { charSet: 'utf8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#0a0a0a' },
      { name: 'apple-mobile-web-app-title', content: SITE_NAME },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: `${SITE_URL}/og-image-1200x630.png` },
      { property: 'og:image:type', content: 'image/png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: SITE_NAME },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@eveevekun' },
      { name: 'twitter:image', content: `${SITE_URL}/twitter-card-1200x600.png` },
      { name: 'twitter:image:alt', content: SITE_NAME },
    ],
    links: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '32x32' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48x48.png' },
      { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon-180x180.png' },
      { rel: 'manifest', href: '/site.webmanifest' },
      { rel: 'stylesheet', href: rootCss },
    ],
  }),
  component: () => (
    <RootDocument>
      <Outlet />
    </RootDocument>
  ),
  // Has to live here rather than on `{-$locale}`: an unknown first segment
  // makes that route's `params.parse` return false, so it never matches and a
  // notFoundComponent on it would never render.
  notFoundComponent: NotFound,
});
