import type { FC } from 'react';

import { createRouter } from '@tanstack/react-router';
import { getGlobalStartContext } from '@tanstack/react-start';
import { Suspense, lazy } from 'react';

import { routeTree } from './routeTree.gen';

// The 404 experience (boot sequence, corruption, 18 error visualizations) is
// ~76kB gzip of code almost no visitor runs. Split it out of the entry chunk.
const NotFound = lazy(async () => import('./routes/-components/NotFound/not-found'));

const LazyNotFound: FC = () => (
  <Suspense fallback={null}>
    <NotFound />
  </Suspense>
);

export const getRouter = () =>
  createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultStaleTime: 5 * 60 * 1000,
    defaultNotFoundComponent: LazyNotFound,
    ssr: {
      nonce: getGlobalStartContext()?.cspNonce ?? '',
    },
  });
