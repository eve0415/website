import handler from "@tanstack/react-start/server-entry";

import { refreshGitHubStats } from "./routes/sys/-utils/github-api";

export default {
  fetch: (request) => handler.fetch(request),
  async scheduled(_event, env, ctx): Promise<void> {
    ctx.waitUntil(refreshGitHubStats(env));
  },
} satisfies ExportedHandler<Env>;
