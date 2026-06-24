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
  retries: 0,
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
    headless: true,
    screenshot: "only-on-failure",
    video: "off",
  },

  projects: [
    {
      name: "chromium",
      use: { viewport: { width: 1440, height: 900 } },
    },
  ],
});
