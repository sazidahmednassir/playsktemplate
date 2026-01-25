// @ts-check
const { defineConfig, devices } = require("@playwright/test");

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: "./tests", // Directory where tests are located
  testMatch: "**/*.spec.js", // Match all test files with .spec.js extension

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 10 : 20,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["allure-playwright"]], // Allure reporting for visualizing test results

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: "https://app-test.informatiq.no/apps/owa-next/", // Base URL for the application under test
    timeout: 80000, // Set test timeout to 60 seconds
    trace: "on", // Enable tracing for debugging
    headless: true, // Run tests in non-headless mode
    screenshot: "only-on-failure", // Capture screenshots only on test failures
    video: "retain-on-failure", // Retain video recordings only on test failures
    launchOptions: {
      args: ["--start-maximized"], // Start browser maximized
    },
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: "Google Chrome",
      use: {
        // ...devices["Desktop Chrome"], channel: "chrome"
        viewport: null,
      },
    },
    // Uncomment the following configurations to enable testing on other browsers

    // {
    //   name: "Firefox", // Test using Firefox
    //   use: {
    //     ...devices["Desktop Firefox"], // Use desktop Firefox configuration
    //     viewport: { width: 1920, height: 1080 }, // Set viewport size
    //   },
    // },

    // {
    //   name: "Webkit", // Test using Webkit (Safari)
    //   use: {
    //     ...devices["Desktop Safari"], // Use desktop Safari configuration
    //     viewport: { width: 1920, height: 1080 }, // Set viewport size
    //   },
    // },

    /* Test against mobile viewports */
    // {
    //   name: "Mobile Chrome",
    //   use: { ...devices["Pixel 5"] },
    // },
    // {
    //   name: "Mobile Safari",
    //   use: { ...devices["iPhone 12"] },
    // },

    /* Test against branded browsers */
    // {
    //   name: "Microsoft Edge",
    //   use: { ...devices["Desktop Edge"], channel: "msedge" },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
