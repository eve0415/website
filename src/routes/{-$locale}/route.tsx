import { Outlet, createFileRoute, notFound } from '@tanstack/react-router';

import { parseLocaleParam } from '#i18n/locale';

export const Route = createFileRoute('/{-$locale}')({
  // The resolved locale comes from the root's context; this only rejects a
  // segment that is not a locale, which `{-$locale}` would otherwise swallow.
  beforeLoad: ({ params }) => {
    if (parseLocaleParam(params.locale) === undefined) throw notFound();
  },
  component: () => <Outlet />,
});
