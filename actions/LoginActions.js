const LoginPage = require("../pages/LoginPage");
const DashboardPage = require("../pages/DashboardPage");
const { expect } = require("@playwright/test");
const BaseActions = require("./BaseActions");

class LoginActions {
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to the login page URL
   * @param {string} url - Login page URL from config.baseURL
   * Step 1: Uses BaseActions.navigate() to go to the given URL
   */
  async navigateToLogin(url) {
    await BaseActions.navigate(this.page, url);
  }

  /**
   * Fill username, password and click the Login button
   * @param {string} username - Username from config.user2.username
   * @param {string} password - Password from config.user2.password
   * Step 1: Fill username → LoginPage.getUsernameInput → page.getByPlaceholder("Username")
   * Step 2: Fill password → LoginPage.getPasswordInput → page.getByPlaceholder("Password")
   * Step 3: Click Login button → LoginPage.getLoginBtn → page.getByRole("button", { name: "Login" })
   */
  async login(username, password) {
    await LoginPage.getUsernameInput(this.page).fill(username);
    await LoginPage.getPasswordInput(this.page).fill(password);
    await LoginPage.getLoginBtn(this.page).click();
  }

  /**
   * Login and wait until the dashboard heading appears (confirms successful login)
   * @param {string} username - Username from config.user2.username
   * @param {string} password - Password from config.user2.password
   * Step 1: Calls this.login() → fills username, password, clicks Login button
   * Step 2: Wait for dashboard heading → DashboardPage.getDashboardHeading → page.locator(".oxd-topbar-header-breadcrumb", { hasText: "Dashboard" })
   */
  async validLogin(username, password) {
    await this.login(username, password);
    await DashboardPage.getDashboardHeading(this.page).waitFor({
      timeout: 10000,
    });
  }

  /**
   * Assert the dashboard heading is visible on screen
   * Step 1: Get dashboard heading → DashboardPage.getDashboardHeading → page.locator(".oxd-topbar-header-breadcrumb", { hasText: "Dashboard" })
   * Step 2: Assert it is visible with 10s timeout
   */
  async verifyDashboardVisible() {
    const heading = DashboardPage.getDashboardHeading(this.page);
    await expect(heading).toBeVisible({ timeout: 10000 });
  }

  /**
   * Assert the current URL does NOT contain "/login" (user is not on login page)
   * Step 1: Check page URL does not match /login/ regex
   */
  async verifyNotOnLoginPage() {
    await expect(this.page).not.toHaveURL(/login/);
  }

  /**
   * Fresh login in a NEW browser context — no stored session, no cookies
   * Used by: loginTests.spec.js → "User can login with valid credentials"
   * @param {object} browser - Playwright browser instance
   * @param {string} url - Login page URL from config.baseURL
   * @param {string} username - Username from config.user2.username
   * @param {string} password - Password from config.user2.password
   * Step 1: Create new browser context with storageState: undefined (no saved session)
   * Step 2: Open a new page in that context
   * Step 3: Navigate to login URL → page.goto(url)
   * Step 4: Fill username → page.getByPlaceholder("Username")
   * Step 5: Fill password → page.getByPlaceholder("Password")
   * Step 6: Click Login button → page.getByRole("button", { name: "Login" })
   * Step 7: Wait for dashboard breadcrumb → page.locator(".oxd-topbar-header-breadcrumb", { hasText: "Dashboard" })
   * Step 8: Assert dashboard heading is visible
   * Step 9: Assert URL no longer contains "/login"
   * Step 10: Close the browser context (cleanup)
   */
  async loginWithoutStoredState(browser, url, username, password) {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    try {
      await page.goto(url);
      await page.getByPlaceholder("Username").fill(username);
      await page.getByPlaceholder("Password").fill(password);
      await page.getByRole("button", { name: "Login" }).click();

      await page
        .locator(".oxd-topbar-header-breadcrumb", { hasText: "Dashboard" })
        .waitFor({ timeout: 10000 });
      await expect(
        page.locator(".oxd-topbar-header-breadcrumb", { hasText: "Dashboard" }),
      ).toBeVisible();
      await expect(page).not.toHaveURL(/login/);
    } finally {
      await context.close();
    }
  }

  /**
   * Verify user is logged in by checking dashboard heading exists and is visible
   * Step 1: Wait for dashboard heading → DashboardPage.getDashboardHeading → page.locator(".oxd-topbar-header-breadcrumb", { hasText: "Dashboard" })
   * Step 2: Assert it is visible
   */
  async verifyLoggedIn() {
    await DashboardPage.getDashboardHeading(this.page).waitFor({
      timeout: 10000,
    });
    await expect(DashboardPage.getDashboardHeading(this.page)).toBeVisible();
  }

  /**
   * Navigate to the app and auto-login if session has expired — used in beforeEach of most tests
   * Used by: All test suites in beforeEach (dashboard, signOut, navigation tests)
   * @param {string} url - Login page URL from config.baseURL
   * @param {string} username - Username from config.user2.username
   * @param {string} password - Password from config.user2.password
   * Step 1: Navigate to URL with domcontentloaded wait → page.goto(url, { waitUntil: "domcontentloaded" })
   * Step 2: Wait for networkidle (catches SPA lazy loading, ignores timeout errors)
   * Step 3: Check if URL contains "login" (session expired)
   *   If YES (session expired):
   *     Step 4: Fill username → LoginPage.getUsernameInput → page.getByPlaceholder("Username")
   *     Step 5: Fill password → LoginPage.getPasswordInput → page.getByPlaceholder("Password")
   *     Step 6: Click Login → LoginPage.getLoginBtn → page.getByRole("button", { name: "Login" })
   *     Step 7: Wait for dashboard heading → DashboardPage.getDashboardHeading → page.locator(".oxd-topbar-header-breadcrumb", { hasText: "Dashboard" })
   *   If NO (session valid): proceed directly, already on dashboard
   */
  async ensureLoggedIn(url, username, password) {
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
    await this.page.waitForLoadState("networkidle").catch(() => {});

    if (this.page.url().includes("login")) {
      await LoginPage.getUsernameInput(this.page).fill(username);
      await LoginPage.getPasswordInput(this.page).fill(password);
      await LoginPage.getLoginBtn(this.page).click();
      await DashboardPage.getDashboardHeading(this.page).waitFor({
        timeout: 15000,
      });
    }
  }

  /**
   * Assert the current URL contains "/login" (user is on the login page)
   * Step 1: Check page URL matches /login/ regex
   */
  async verifyOnLoginPage() {
    await expect(this.page).toHaveURL(/login/);
  }

  /**
   * Assert the "Invalid credentials" error message is visible after a failed login
   * Step 1: Get error message → LoginPage.getErrorMessage → page.locator(".oxd-alert-content--error", { hasText: "Invalid credentials" })
   * Step 2: Assert it is visible with 10s timeout
   */
  async verifyLoginErrorVisible() {
    const errorMsg = LoginPage.getErrorMessage(this.page);
    await expect(errorMsg).toBeVisible({ timeout: 10000 });
  }

  /**
   * Assert the "Required" field validation error is visible (for empty fields)
   * Step 1: Get required error → LoginPage.getRequiredError → page.locator(".oxd-input-field-error-message")
   * Step 2: Assert first error is visible with 5s timeout
   */
  async verifyRequiredFieldError() {
    const requiredError = LoginPage.getRequiredError(this.page);
    await expect(requiredError.first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Login with invalid credentials in a fresh context and verify error appears
   * Used by: negativeLoginTests.spec.js → invalid password, invalid username tests
   * @param {object} browser - Playwright browser instance
   * @param {string} url - Login page URL from config.baseURL
   * @param {string} username - Valid or invalid username to test
   * @param {string} password - Valid or invalid password to test
   * Step 1: Create new browser context with no stored session (storageState: undefined)
   * Step 2: Open a new page in that context
   * Step 3: Navigate to login URL and wait for networkidle → page.goto(url, { waitUntil: "networkidle" })
   * Step 4: Wait for username input to render → page.getByPlaceholder("Username").waitFor()
   * Step 5: Fill username → page.getByPlaceholder("Username")
   * Step 6: Fill password → page.getByPlaceholder("Password")
   * Step 7: Click Login button → page.getByRole("button", { name: "Login" })
   * Step 8: Assert error message visible → page.locator(".oxd-alert-content--error, .oxd-alert--error").first()
   * Step 9: Close the browser context (cleanup)
   */
  async loginAndExpectFailure(browser, url, username, password) {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: "networkidle" });
      await page.getByPlaceholder("Username").waitFor({ timeout: 15000 });
      await page.getByPlaceholder("Username").fill(username);
      await page.getByPlaceholder("Password").fill(password);
      await page.getByRole("button", { name: "Login" }).click();

      const errorMsg = page.locator(".oxd-alert-content--error, .oxd-alert--error");
      await expect(errorMsg.first()).toBeVisible({ timeout: 15000 });
    } finally {
      await context.close();
    }
  }

  /**
   * Click login without entering any credentials and verify "Required" errors appear
   * Used by: negativeLoginTests.spec.js → "Login fails with empty fields" test
   * @param {object} browser - Playwright browser instance
   * @param {string} url - Login page URL from config.baseURL
   * Step 1: Create new browser context with no stored session (storageState: undefined)
   * Step 2: Open a new page in that context
   * Step 3: Navigate to login URL → page.goto(url)
   * Step 4: Wait for username input to render → page.getByPlaceholder("Username").waitFor()
   * Step 5: Click Login button without filling any fields → page.getByRole("button", { name: "Login" })
   * Step 6: Assert "Required" validation error visible → page.locator(".oxd-input-field-error-message").first()
   * Step 7: Close the browser context (cleanup)
   */
  async loginWithEmptyFields(browser, url) {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    try {
      await page.goto(url);
      await page.getByPlaceholder("Username").waitFor({ timeout: 10000 });
      await page.getByRole("button", { name: "Login" }).click();

      const requiredErrors = page.locator(".oxd-input-field-error-message");
      await expect(requiredErrors.first()).toBeVisible({ timeout: 10000 });
    } finally {
      await context.close();
    }
  }
}

module.exports = LoginActions;
