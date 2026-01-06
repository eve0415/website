import { defineConfig } from "vitest/config";
import storybookTest from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { cloudflareTest } from "@cloudflare/vitest-pool-workers";

export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul",
    },
    projects: [
      {
        extends: true,
        plugins: [cloudflareTest({}), storybookTest()],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
          server: {
            deps: {
              // Inline @tanstack packages so that our virtual module plugin can intercept
              // the #tanstack-start-server-fn-manifest import
              inline: ["@tanstack/start-server-core", "@tanstack/react-start"],
            },
          },
        },
      },
    ],
  },
});
