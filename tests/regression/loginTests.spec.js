const { test } = require("../fixture/customfixture");
const config = require("../../config/env.config");

test.describe("Login Tests", () => {
  /**
   * TC-LOGIN-001: Fresh login with valid credentials
   * Precondition: No stored session — uses a clean browser context
   * Steps:
   *   1. Open fresh browser (no cookies/session)
   *   2. Navigate to login page
   *   3. Enter valid username and password
   *   4. Click Login button
   * Validation: Dashboard heading "Dashboard" is visible after login
   * Expected: User lands on the dashboard, URL no longer contains "/login"
   */
  test("User can login with valid credentials and land on dashboard", async ({
    browser,
    actions,
  }) => {
    await actions.login.loginWithoutStoredState(
      browser,
      config.baseURL,
      config.user2.username,
      config.user2.password,
    );
  });

  /**
   * TC-LOGIN-002: Stored auth session keeps user logged in
   * Precondition: Session saved by auth.setup.js in .auth/state.json
   * Steps:
   *   1. Navigate to login URL with stored session cookies
   *   2. If session expired → auto re-login (ensureLoggedIn handles this)
   *   3. Check current URL
   * Validation: URL does NOT contain "/login"
   * Expected: User is on the dashboard without needing to manually login
   */
  test("User is on dashboard after using stored auth state", async ({
    actions,
  }) => {
    await actions.login.ensureLoggedIn(
      config.baseURL,
      config.user2.username,
      config.user2.password,
    );
    await actions.login.verifyNotOnLoginPage();
  });
});
