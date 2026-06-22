// @ts-check
const { defineConfig } = require("@playwright/test");
const config = require("./config/env.config");

const isParallel = process.env.PARALLEL === "true";

module.exports = defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.js",
  globalSetup: require.resolve("./global.setup.js"),

  fullyParallel: isParallel,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 180000,
  workers: isParallel ? 4 : 1,

  reporter: [["list"], ["html", { open: "never" }], ["allure-playwright"]],

  use: {
    baseURL: config.admin.baseURL,
    actionTimeout: 60000,
    navigationTimeout: 60000,
    trace: "on-first-retry",
    headless: true,
    screenshot: "on",
    video: "retain-on-failure",
  },

  projects: [
    { name: "setup", testMatch: /auth\.setup\.js/ },
    {
      name: "chromium",
      use: {
        viewport: { width: 1440, height: 1000 },
        storageState: `${config.authDir}/owner.json`,
      },
      dependencies: ["setup"],
    },
  ],
});
