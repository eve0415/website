import handler from '@tanstack/react-start/server-entry';

import { refreshGitHubStats } from './routes/sys/-utils/github-stats';

export default {
  fetch: (request, _env, _ctx) => {
    const cf = request.cf;
    const headers = new Headers(request.headers);

    // Inject Cloudflare request properties as custom headers
    // These are not exposed by TanStack Start, so we pass them through headers
    if (cf?.tlsVersion) headers.set('X-CF-TLS-Version', cf.tlsVersion);
    if (cf?.tlsCipher) headers.set('X-CF-TLS-Cipher', cf.tlsCipher);
    if (cf?.httpProtocol) headers.set('X-CF-HTTP-Protocol', cf.httpProtocol);
    if (cf?.colo) headers.set('X-CF-Colo', String(cf.colo));

    const modifiedRequest = new Request(request, { headers });
    return handler.fetch(modifiedRequest);
  },
  async scheduled(_event, env, ctx): Promise<void> {
    ctx.waitUntil(refreshGitHubStats(env));
  },
} satisfies ExportedHandler<Env>;
