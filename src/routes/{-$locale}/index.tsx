import { createFileRoute } from '@tanstack/react-router';

import { localeHead } from '#i18n/head';
import { parseLocaleParam } from '#i18n/locale';

export const Route = createFileRoute('/{-$locale}/')({
  head: ({ params }) => localeHead(parseLocaleParam(params.locale) ?? 'ja', '/'),
  component: () => <h1 className='p-8 text-3xl font-bold'>eve0415</h1>,
});
