// @ts-check
const { defineConfig, devices } = require("@playwright/test");
const config = require("./config/env.config");

const isParallel = process.env.PARALLEL === "true";

// Chromium fake-media flags. Per-spec test.use() can override
// --use-file-for-fake-video-capture to feed mismatch / no-face / multi-face Y4M.
// The default here is the baseline face so any test that does not override
// gets the "match" feed.
const fakeMediaArgs = config.lms.useRealCamera
  ? []
  : [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      `--use-file-for-fake-video-capture=${config.lms.faceFixtures.baseline}`,
    ];

module.exports = defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.js",

  /* Global setup — one-time login, saves session to .auth/state.json */
  globalSetup: require.resolve("./auth.setup.js"),

  /* Parallel mode controlled via PARALLEL=true env var */
  fullyParallel: isParallel,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 120000,

  /* Parallel: multiple workers | Serial: single worker */
  workers: isParallel ? 4 : 1,

  reporter: [["allure-playwright"]],

  use: {
    baseURL: config.baseURL,

    /* All tests reuse session from auth.setup.js — no re-login per test */
    storageState: config.authStatePath,

    actionTimeout: 80000,
    trace: "on",
    headless: true,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    launchOptions: {
      args: ["--start-maximized", ...fakeMediaArgs],
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
