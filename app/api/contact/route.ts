import { redirect } from 'next/navigation';

export const runtime = 'edge';

export function POST(request: Request) {
  console.log(request);

  redirect('/contact');
}
