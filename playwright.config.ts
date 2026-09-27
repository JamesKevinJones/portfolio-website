import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
// `npm run test:e2e:prod` tests the production build; plain `test:e2e` uses the dev
// server for a fast loop. Reading the npm script name keeps this cross-platform
// (PowerShell has no inline `VAR=1 cmd` syntax).
const prod = process.env.npm_lifecycle_event === "test:e2e:prod" || !!process.env.CI;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 45_000,
  expect: { timeout: 6_000 },
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: prod ? `npm run build && npm run start -- -p ${PORT}` : `npm run dev -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
