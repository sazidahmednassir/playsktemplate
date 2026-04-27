const { test } = require("../fixture/customfixture");
const { expect } = require("@playwright/test");
const config = require("../../config/env.config");

test.describe("Dashboard Tests", () => {
  test.beforeEach(async ({ actions }) => {
    await actions.login.ensureLoggedIn(
      config.baseURL,
      config.user2.username,
      config.user2.password,
    );
  });

  test("Dashboard heading is visible after login", async ({ actions }) => {
    await actions.dashboard.verifyDashboardLoaded();
  });

  test("Quick Launch section is visible with cards", async ({ actions }) => {
    await actions.dashboard.verifyQuickLaunchVisible();
    const count = await actions.dashboard.getQuickLaunchCount();
    expect(count).toBeGreaterThan(0);
  });

  test("Time at Work widget is visible on dashboard", async ({ actions }) => {
    await actions.dashboard.verifyTimeAtWorkWidget();
  });

  test("User can click Assign Leave quick launch card", async ({
    actions,
    page,
  }) => {
    await actions.dashboard.clickQuickLaunchCard("Assign Leave");
    await expect(page).not.toHaveURL(/dashboard/, { timeout: 10000 });
  });
});
