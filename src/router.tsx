import { createRouter } from '@tanstack/react-router';
import { getGlobalStartContext } from '@tanstack/react-start';

import NotFound from './routes/-components/NotFound/not-found';
import { routeTree } from './routeTree.gen';

export const getRouter = () =>
  createRouter({
    routeTree,
    scrollRestoration: true,
    defaultNotFoundComponent: NotFound,
    ssr: {
      nonce: getGlobalStartContext()?.cspNonce ?? '',
    },
  });
