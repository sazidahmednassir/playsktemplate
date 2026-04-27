const { test } = require("../fixture/customfixture");
const { expect } = require("@playwright/test");
const config = require("../../config/env.config");

test.describe("Sign Out Tests", () => {
  /**
   * beforeEach: Ensure user is authenticated before every sign out test
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
   * TC-SIGN-001: Logout redirects user to login page
   * Precondition: User is logged in (beforeEach)
   * Steps:
   *   1. Open user dropdown menu (top-right ".oxd-userdropdown")
   *   2. Click "Logout" menu item
   *   3. Wait for page to finish loading
   *   4. Check the URL after logout
   * Validation: URL contains "/login"
   * Expected: User is logged out and redirected to the login page
   */
  test("User can logout from user dropdown and is redirected to login page", async ({
    actions,
    page,
  }) => {
    await actions.profile.logout();
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });

  /**
   * TC-SIGN-002: Session is invalidated after logout — cannot access app
   * Precondition: User is logged in (beforeEach)
   * Steps:
   *   1. Perform logout (open dropdown → click Logout)
   *   2. Verify redirected to login page (URL contains "/login")
   *   3. Try navigating back to the app URL directly
   *   4. Check the URL again
   * Validation: URL still contains "/login" after re-navigation attempt
   * Expected: Session is destroyed — navigating to app URL forces user back to login page
   */
  test("After logout, navigating to app redirects to login", async ({
    actions,
    page,
  }) => {
    await actions.profile.logout();
    await expect(page).toHaveURL(/login/, { timeout: 10000 });

    await page.goto(config.baseURL);
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });
});
