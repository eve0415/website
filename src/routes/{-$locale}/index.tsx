import { createFileRoute } from '@tanstack/react-router';

import { localeHead } from '#i18n/head';

export const Route = createFileRoute('/{-$locale}/')({
  head: ({ match }) => localeHead(match.context.locale, '/'),
  component: () => <h1 className='p-8 text-3xl font-bold'>eve0415</h1>,
});
