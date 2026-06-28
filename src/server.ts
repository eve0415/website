import handler from '@tanstack/react-start/server-entry';
import { drizzle } from 'drizzle-orm/d1';

import * as schema from './db/schema';
import { refreshGitHubStats } from './routes/sys/-utils/github-stats';

export { SkillsAnalysisWorkflow } from './workflows/skills-analysis';

export default {
  fetch: async (request, env, _ctx) =>
    handler.fetch(request, {
      context: {
        db: drizzle(env.SKILLS_DB, { schema }),
      },
    }),
  scheduled(event, env, ctx) {
    // Hourly: refresh GitHub stats
    // Cron: "0 * * * *" in wrangler.json
    if (event.cron === '0 * * * *') ctx.waitUntil(refreshGitHubStats(env));

    // Weekly (Sunday 3:30 AM JST = Saturday 18:30 UTC): trigger skills analysis
    // Cron: "30 18 * * 6" in wrangler.json
    if (event.cron === '30 18 * * 6') ctx.waitUntil(env.SKILLS_WORKFLOW.create());
  },
} satisfies ExportedHandler<Env>;
