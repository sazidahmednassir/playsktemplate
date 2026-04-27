const { test } = require("../fixture/customfixture");
const { expect } = require("@playwright/test");
const config = require("../../config/env.config");

test.describe("Sign Out Tests", () => {
  test.beforeEach(async ({ actions }) => {
    await actions.login.ensureLoggedIn(
      config.baseURL,
      config.user2.username,
      config.user2.password,
    );
  });

  test("User can logout from user dropdown and is redirected to login page", async ({
    actions,
    page,
  }) => {
    await actions.profile.logout();
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });

  test("After logout, navigating to app redirects to login", async ({
    actions,
    page,
  }) => {
    await actions.profile.logout();
    await expect(page).toHaveURL(/login/, { timeout: 10000 });

    // Try navigating back to the app
    await page.goto(config.baseURL);
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });
});
