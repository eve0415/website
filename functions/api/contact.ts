interface Env {
  CF_SECRET_KEY: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const onRequest: PagesFunction<Env> = async context => {
  const { request } = context;

  if (request.method === 'OPTIONS') {
    if (
      request.headers.get('Origin') !== null &&
      request.headers.get('Access-Control-Request-Method') !== null &&
      request.headers.get('Access-Control-Request-Headers') !== null
    ) {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    return new Response(null, { headers: { Allow: 'POST' } });
  }

  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (request.headers.get('Content-Type') !== 'application/json') {
    return new Response(null, {
      status: 415,
      statusText: 'Unsupported Media Type',
      headers: corsHeaders,
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
