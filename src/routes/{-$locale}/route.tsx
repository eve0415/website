import { Outlet, createFileRoute, notFound } from '@tanstack/react-router';

import { parseLocaleParam } from '#i18n/locale';

export const Route = createFileRoute('/{-$locale}')({
  beforeLoad: ({ params }) => {
    const locale = parseLocaleParam(params.locale);
    if (locale === undefined) throw notFound();

    return { locale };
  },
  component: () => <Outlet />,
});
