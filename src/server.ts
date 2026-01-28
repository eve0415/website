import handler from '@tanstack/react-start/server-entry';
import { drizzle } from 'drizzle-orm/d1';

import * as schema from './db/schema';
import { refreshGitHubStats } from './routes/sys/-utils/github-stats';
export { SkillsAnalysisWorkflow } from './workflows/skills-analysis';

export default {
  fetch: async (request, env, _ctx) => {
    const { cf } = request;
    const headers = new Headers(request.headers);

    // Inject Cloudflare request properties as custom headers
    // These are not exposed by TanStack Start, so we pass them through headers
    if (cf?.tlsVersion) headers.set('X-CF-TLS-Version', cf.tlsVersion);
    if (cf?.tlsCipher) headers.set('X-CF-TLS-Cipher', cf.tlsCipher);
    if (cf?.httpProtocol) headers.set('X-CF-HTTP-Protocol', cf.httpProtocol);
    if (cf?.colo) headers.set('X-CF-Colo', String(cf.colo));

    return handler.fetch(new Request(request, { headers }), {
      context: {
        db: drizzle(env.SKILLS_DB, { schema, casing: 'snake_case' }),
      },
    });
  },
  scheduled(event, env, ctx) {
    // Hourly: refresh GitHub stats
    ctx.waitUntil(refreshGitHubStats(env));

    // Weekly (Sunday 3:30 AM JST = Saturday 18:30 UTC): trigger skills analysis
    // Cron: "30 18 * * 6" in wrangler.json
    if (event.cron === '30 18 * * 6') ctx.waitUntil(env.SKILLS_WORKFLOW.create());
  },
} satisfies ExportedHandler<Env>;
