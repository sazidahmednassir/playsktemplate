// @ts-check
const { defineConfig } = require("@playwright/test");
const config = require("./config/env.config");

const isParallel = process.env.PARALLEL === "true";

module.exports = defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.js",

  fullyParallel: isParallel,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 120000,
  workers: isParallel ? 4 : 1,

  reporter: [["allure-playwright"]],

  use: {
    baseURL: config.baseURL,
    actionTimeout: 80000,
    trace: "on",
    headless: false,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "Google Chrome",
      use: {
        viewport: null,
        launchOptions: {
          args: ["--start-maximized"],
        },
      },
    },
  ],
});
