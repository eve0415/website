import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/{-$locale}/')({
  component: () => <h1 className='p-8 text-3xl font-bold'>eve0415</h1>,
});
