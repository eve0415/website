import { Outlet, createFileRoute } from '@tanstack/react-router';

import { parseLocaleParam } from '#i18n/locale';

export const Route = createFileRoute('/{-$locale}')({
  // Returning false means "this route does not match", so an unknown first
  // segment falls through to a 404 instead of being swallowed by `{-$locale}`
  // and rendering the home page. The resolved locale comes from root context.
  params: {
    parse: params => (parseLocaleParam(params.locale) === undefined ? false : params),
  },
  component: () => <Outlet />,
});
