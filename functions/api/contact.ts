interface Env {
  CF_SECRET_KEY: string;
}

export const onRequest: PagesFunction<Env> = async context => {
  const { request } = context;

  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (request.headers.get('Content-Type') !== 'application/json') {
    return new Response(null, {
      status: 415,
      statusText: 'Unsupported Media Type',
    });
  }

  const data = await request.json<{
    name: string;
    reply?: string;
    title: string;
    message: string;
    turnstile: string;
  }>();

  console.log(data);

  return new Response();
};
