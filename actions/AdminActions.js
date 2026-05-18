// Action class for eLearning23 LMS admin flows — business logic + assertions.
// Source-of-truth: data/Proctoring Pro.xlsx → "Admin" → TC-1 (Log in).
// Locator trace (POM): every interaction routes through AdminPage.

const AdminPage = require("../pages/AdminPage");
const { expect } = require("@playwright/test");

class AdminActions {
  constructor(page) {
    this.page = page;
  }

  /**
   * Precondition + step 1: open the login page and authenticate as admin.
   * Test is run with an empty storage state (see the admin-login project in
   * playwright.config.js), so the login form is always shown.
   *
   * @param {string} baseURL   e.g. https://education.elearning23.com/
   * @param {string} username  Admin username from config.lms.admin.username
   * @param {string} password  Admin password from config.lms.admin.password
   */
  async loginAsAdmin(baseURL, username, password) {
    const loginURL = baseURL.replace(/\/$/, "") + "/login/index.php";
    await this.page.goto(loginURL, { waitUntil: "domcontentloaded" });

    const usernameField = AdminPage.getUsernameInput(this.page);
    await usernameField.waitFor({ state: "visible" });
    await usernameField.fill(username);
    await AdminPage.getPasswordInput(this.page).fill(password);
    await AdminPage.getLoginBtn(this.page).click();

    await this.page.waitForURL("**/my/**", { timeout: 30000 });
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Step 2: confirm the dashboard is visible after login.
   * Asserts the <h1>Dashboard</h1> heading on /my/.
   */
  async verifyDashboardVisible() {
    await expect(AdminPage.getDashboardHeading(this.page))
      .toBeVisible({ timeout: 15000 });
    await expect(this.page).toHaveURL(/\/my\/?/);
  }

  /**
   * TC-2 steps: open user menu and click Log out. Moodle redirects to the
   * homepage (config.lms.baseURL) — the spec asserts the final URL.
   */
  async logout() {
    await AdminPage.getUserMenuBtn(this.page).click();
    const logout = AdminPage.getLogoutLink(this.page);
    await logout.waitFor({ state: "visible", timeout: 10000 });
    await logout.click();
    await this.page.waitForLoadState("networkidle");
  }
}

module.exports = AdminActions;
