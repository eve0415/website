import { createRouter } from '@tanstack/react-router';

import NotFound from './routes/-components/NotFound/not-found';
import { routeTree } from './routeTree.gen';

export const getRouter = () =>
  createRouter({
    routeTree,
    scrollRestoration: true,
    defaultNotFoundComponent: NotFound,
  });
