import { createFileRoute, rootRouteId, useRouteContext } from '@tanstack/react-router';

import { localeHead } from '#i18n/head';

import { Hero } from './-/home/hero';
import { Highlights } from './-/home/highlights';

const Home = () => {
  const locale = useRouteContext({ from: rootRouteId, select: context => context.locale });

  return (
    <>
      <Hero locale={locale} />
      <Highlights locale={locale} />
    </>
  );
};

export const Route = createFileRoute('/{-$locale}/')({
  head: ({ match }) => localeHead(match.context.locale, '/'),
  component: Home,
});
