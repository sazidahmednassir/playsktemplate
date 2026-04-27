const { test } = require("../fixture/customfixture");
const config = require("../../config/env.config");

test.describe("Negative Login Tests", () => {
  /**
   * TC-NEG-001: Login with valid username but wrong password
   * Precondition: No stored session — uses a clean browser context
   * Steps:
   *   1. Open fresh browser (no cookies/session)
   *   2. Navigate to login page, wait for page to fully load
   *   3. Enter valid username from config
   *   4. Enter wrong password "wrongPassword123"
   *   5. Click Login button
   * Validation: Error alert ".oxd-alert-content--error" or ".oxd-alert--error" is visible
   * Expected: Login fails, user stays on login page with "Invalid credentials" error
   */
  test("Login fails with invalid password", async ({ browser, actions }) => {
    await actions.login.loginAndExpectFailure(
      browser,
      config.baseURL,
      config.user2.username,
      "wrongPassword123",
    );
  });

  /**
   * TC-NEG-002: Login with invalid username but correct password
   * Precondition: No stored session — uses a clean browser context
   * Steps:
   *   1. Open fresh browser (no cookies/session)
   *   2. Navigate to login page, wait for page to fully load
   *   3. Enter wrong username "invalidUser"
   *   4. Enter valid password from config
   *   5. Click Login button
   * Validation: Error alert ".oxd-alert-content--error" or ".oxd-alert--error" is visible
   * Expected: Login fails, user stays on login page with "Invalid credentials" error
   */
  test("Login fails with invalid username", async ({ browser, actions }) => {
    await actions.login.loginAndExpectFailure(
      browser,
      config.baseURL,
      "invalidUser",
      config.user2.password,
    );
  });

  /**
   * TC-NEG-003: Login with empty username and password fields
   * Precondition: No stored session — uses a clean browser context
   * Steps:
   *   1. Open fresh browser (no cookies/session)
   *   2. Navigate to login page
   *   3. Do NOT fill any fields
   *   4. Click Login button directly
   * Validation: "Required" field error ".oxd-input-field-error-message" is visible
   * Expected: Form validation triggers, "Required" error shown under empty fields
   */
  test("Login fails with empty fields showing required errors", async ({
    browser,
    actions,
  }) => {
    await actions.login.loginWithEmptyFields(browser, config.baseURL);
  });
});
