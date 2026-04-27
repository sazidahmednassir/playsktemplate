// @ts-check
const { defineConfig, devices } = require("@playwright/test");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const isParallel = process.env.PARALLEL === "true";

module.exports = defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.js",

  /* Global setup — one-time login, saves session to .auth/state.json */
  globalSetup: require.resolve("./auth.setup.js"),

  /* Parallel mode controlled via PARALLEL=true env var */
  fullyParallel: isParallel,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,

  /* Parallel: multiple workers | Serial: single worker */
  workers: isParallel ? 4 : 1,

  reporter: [["allure-playwright"]],

  use: {
    baseURL: process.env.BASE_URL,

    /* All tests reuse session from auth.setup.js — no re-login per test */
    storageState: process.env.AUTH_STATE_PATH,

    timeout: 80000,
    trace: "on",
    headless: false,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    launchOptions: {
      args: ["--start-maximized"],
    },
  },

  projects: [
    {
      name: "Google Chrome",
      use: {
        viewport: null,
      },
    },
  ],
});
