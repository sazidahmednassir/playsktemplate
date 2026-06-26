// @ts-check
const { defineConfig } = require("@playwright/test");
const config = require("./config/env.config");

const isParallel = process.env.PARALLEL === "true";

module.exports = defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.js",
  globalSetup: "./global-setup.js",

  fullyParallel: isParallel,
  forbidOnly: !!process.env.CI,
  // One retry tolerates occasional admin-portal timing flakes (networkidle on the
  // admin host under the full suite); deterministic app-defect failures
  // (BUG-001/002/003) still fail on every attempt.
  retries: process.env.CI ? 2 : 1,
  timeout: 60000,
  workers: 1,

  reporter: [
    ["list"],
    ["json", { outputFile: "evidence/results.json" }],
    ["html", { outputFolder: "evidence/html-report", open: "never" }],
  ],

  use: {
    baseURL: config.baseURL,
    actionTimeout: 20000,
    navigationTimeout: 30000,
    trace: "retain-on-failure",
    // Headed locally (visible, full-screen, matches the MCP browser in .mcp.json);
    // headless in CI where there is no display.
    headless: !!process.env.CI,
    screenshot: "only-on-failure",
    video: "off",
  },

  projects: [
    {
      name: "chromium",
      use: { viewport: { width: 1920, height: 1200 } },
    },
  ],
});
