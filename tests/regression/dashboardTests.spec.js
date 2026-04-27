const { test } = require("../fixture/customfixture");
const { expect } = require("@playwright/test");
const config = require("../../config/env.config");

test.describe("Dashboard Tests", () => {
  /**
   * beforeEach: Ensure user is authenticated before every dashboard test
   * Uses ensureLoggedIn() → navigates to app, auto re-logins if session expired
   */
  test.beforeEach(async ({ actions }) => {
    await actions.login.ensureLoggedIn(
      config.baseURL,
      config.user2.username,
      config.user2.password,
    );
  });

  /**
   * TC-DASH-001: Dashboard heading is visible after login
   * Precondition: User is logged in (beforeEach)
   * Steps:
   *   1. Check the top breadcrumb area for "Dashboard" text
   * Validation: Element ".oxd-topbar-header-breadcrumb" with text "Dashboard" is visible
   * Expected: Dashboard page loaded successfully with heading displayed
   */
  test("Dashboard heading is visible after login", async ({ actions }) => {
    await actions.dashboard.verifyDashboardLoaded();
  });

  /**
   * TC-DASH-002: Quick Launch section displays shortcut cards
   * Precondition: User is logged in (beforeEach)
   * Steps:
   *   1. Check Quick Launch cards area is visible
   *   2. Count the number of Quick Launch cards
   * Validation: At least one ".orangehrm-quick-launch-card" element is visible, count > 0
   * Expected: Quick Launch section shows shortcut cards (Assign Leave, Leave List, etc.)
   */
  test("Quick Launch section is visible with cards", async ({ actions }) => {
    await actions.dashboard.verifyQuickLaunchVisible();
    const count = await actions.dashboard.getQuickLaunchCount();
    expect(count).toBeGreaterThan(0);
  });

  /**
   * TC-DASH-003: "Time at Work" widget is displayed on dashboard
   * Precondition: User is logged in (beforeEach)
   * Steps:
   *   1. Check for the "Time at Work" widget in the dashboard grid
   * Validation: Element ".oxd-grid-item.orangehrm-dashboard-widget" with text "Time at Work" is visible
   * Expected: Time at Work attendance widget is rendered on the dashboard
   */
  test("Time at Work widget is visible on dashboard", async ({ actions }) => {
    await actions.dashboard.verifyTimeAtWorkWidget();
  });

  /**
   * TC-DASH-004: Clicking "Assign Leave" card navigates to Leave module
   * Precondition: User is logged in (beforeEach)
   * Steps:
   *   1. Find the "Assign Leave" Quick Launch card
   *   2. Click the card
   *   3. Check the URL after navigation
   * Validation: URL no longer contains "dashboard"
   * Expected: User is navigated away from dashboard to the Assign Leave page
   */
  test("User can click Assign Leave quick launch card", async ({
    actions,
    page,
  }) => {
    await actions.dashboard.clickQuickLaunchCard("Assign Leave");
    await expect(page).not.toHaveURL(/dashboard/, { timeout: 10000 });
  });
});
