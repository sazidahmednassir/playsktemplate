// @ts-check
const { defineConfig, devices } = require("@playwright/test");
const config = require("./config/env.config");

const isParallel = process.env.PARALLEL === "true";

// Per codebase-rules §2: one spec per Excel tab. Per-TC launch args (different
// Y4M camera feeds, no-camera, denied-permission) cannot live inside a
// describe block — Playwright forbids `test.use({launchOptions})` there.
// Solution: define one project per launch profile and filter by test tag.
//
// Tag map (set on each test title in tests/student/student.spec.js):
//   @baseline          → TC-1, TC-6   (baseline.y4m, camera+mic granted)
//   @mismatch          → TC-2         (mismatch.y4m, camera+mic granted)
//   @permissionDenied  → TC-3         (baseline.y4m, no permissions)
//   @noCamera          → TC-4         (no fake-device flag at all)
//   @noFace            → TC-5a        (no-face.y4m)
//   @multiFace         → TC-5b        (multi-face.y4m)
const fakeMediaArgs = (videoFile) =>
  config.lms.useRealCamera
    ? []
    : [
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
        `--use-file-for-fake-video-capture=${videoFile}`,
      ];

const studentTagPattern = /@(baseline|mismatch|permissionDenied|noCamera|noFace|multiFace)\b/;

module.exports = defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.js",
  // Old per-TC files in tests/regression are superseded by tests/student/student.spec.js.
  testIgnore: ["tests/regression/**"],

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
    headless: false,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    // Default browser project for non-student tests. Skips any student-tagged test.
    {
      name: "Google Chrome",
      grepInvert: studentTagPattern,
      use: {
        viewport: null,
        launchOptions: {
          args: ["--start-maximized", ...fakeMediaArgs(config.lms.faceFixtures.baseline)],
        },
      },
    },

    // Student | Proctoring Pro — one project per launch profile.
    {
      name: "student-baseline",
      grep: /@baseline\b/,
      use: {
        viewport: null,
        storageState: undefined,
        baseURL: config.lms.baseURL,
        permissions: ["camera", "microphone"],
        launchOptions: {
          args: ["--start-maximized", ...fakeMediaArgs(config.lms.faceFixtures.baseline)],
        },
      },
    },
    {
      name: "student-mismatch",
      grep: /@mismatch\b/,
      use: {
        viewport: null,
        storageState: undefined,
        baseURL: config.lms.baseURL,
        permissions: ["camera", "microphone"],
        launchOptions: {
          args: ["--start-maximized", ...fakeMediaArgs(config.lms.faceFixtures.mismatch)],
        },
      },
    },
    {
      name: "student-permission-denied",
      grep: /@permissionDenied\b/,
      use: {
        viewport: null,
        storageState: undefined,
        baseURL: config.lms.baseURL,
        permissions: [], // no camera/mic granted at context creation
        launchOptions: {
          args: ["--start-maximized", ...fakeMediaArgs(config.lms.faceFixtures.baseline)],
        },
      },
    },
    {
      name: "student-no-camera",
      grep: /@noCamera\b/,
      use: {
        viewport: null,
        storageState: undefined,
        baseURL: config.lms.baseURL,
        permissions: ["camera", "microphone"],
        launchOptions: {
          // Intentionally omit --use-fake-device-for-media-stream so Chromium reports no video device.
          args: ["--start-maximized"],
        },
      },
    },
    {
      name: "student-no-face",
      grep: /@noFace\b/,
      use: {
        viewport: null,
        storageState: undefined,
        baseURL: config.lms.baseURL,
        permissions: ["camera", "microphone"],
        launchOptions: {
          args: ["--start-maximized", ...fakeMediaArgs(config.lms.faceFixtures.noFace)],
        },
      },
    },
    {
      name: "student-multi-face",
      grep: /@multiFace\b/,
      use: {
        viewport: null,
        storageState: undefined,
        baseURL: config.lms.baseURL,
        permissions: ["camera", "microphone"],
        launchOptions: {
          args: ["--start-maximized", ...fakeMediaArgs(config.lms.faceFixtures.multiFace)],
        },
      },
    },
  ],
});
