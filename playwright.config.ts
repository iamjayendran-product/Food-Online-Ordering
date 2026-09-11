import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./tests/support/global-setup.ts",
  workers: 1,
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `next dev --port ${PORT}`,
    // `port`, not `url`: readiness just needs the dev server listening, not
    // a 2xx at "/" — there's no page at "/" until F2.
    port: PORT,
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? "",
    },
  },
});
