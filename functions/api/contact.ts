interface Env {
  CF_SECRET_KEY: string;
  DKIM_PRIVATE_KEY: string;
  MAIL_ADDRESS: string;
}

export const onRequest: PagesFunction<Env> = async context => {
  const {
    request,
    env: { CF_SECRET_KEY, DKIM_PRIVATE_KEY, MAIL_ADDRESS },
    waitUntil,
  } = context;

  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (request.headers.get('Content-Type') !== 'application/json') {
    return new Response(null, {
      status: 415,
      statusText: 'Unsupported Media Type',
    });
  }

  const { name, reply, title, message, turnstile } = await request.json<{
    name: string;
    reply?: string;
    title: string;
    message: string;
    turnstile: string;
  }>();

  const formdata = new FormData();
  formdata.append('secret', CF_SECRET_KEY);
  formdata.append('response', turnstile);
  formdata.append('remoteip', request.headers.get('CF-Connecting-IP') ?? '');

  const { success } = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formdata,
  })
    .then(res => res.json<{ success: boolean }>())
    .then(res => res);
  if (!success) return new Response('Invalid captcha', { status: 403 });

  waitUntil(
    fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ name: 'Contact Form', email: MAIL_ADDRESS }],
            dkim_domain: `eve0415.net`,
            dkim_selector: `mailchannels`,
            dkim_private_key: DKIM_PRIVATE_KEY,
          },
        ],
        from: { name: 'Cloudflare Worker', email: 'noreply@eve0415.net' },
        subject: title,
        content: [
          {
            type: `text/plain`,
            value: [`お名前: ${name}`, `返信先: ${reply ?? 'なし'}`, `お問い合わせ内容: `, message].join(
              '\n'
            ),
          },
        ],
      }),
    })
      .then(console.log)
      .catch(console.error)
  );

  return new Response(null, { status: 202 });
};
