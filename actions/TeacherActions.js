// Action class for eLearning23 LMS teacher flows — business logic + assertions.
// Source-of-truth: excel/Proctoring Pro.xlsx → "Teacher" → TC-1 (Log in).
// Locator trace (POM): every interaction routes through TeacherPage.

const TeacherPage = require("../pages/TeacherPage");
const { expect } = require("@playwright/test");

class TeacherActions {
  constructor(page) {
    this.page = page;
  }

  /**
   * Precondition + step 1: open the login page and authenticate as teacher.
   * Test runs with an empty storage state (see the teacher-login project in
   * playwright.config.js), so the login form is always shown.
   *
   * @param {string} baseURL   e.g. https://education.elearning23.com/
   * @param {string} username  Teacher username from config.lms.teacher.username
   * @param {string} password  Teacher password from config.lms.teacher.password
   */
  async loginAsTeacher(baseURL, username, password) {
    const loginURL = baseURL.replace(/\/$/, "") + "/login/index.php";
    await this.page.goto(loginURL, { waitUntil: "domcontentloaded" });

    const usernameField = TeacherPage.getUsernameInput(this.page);
    await usernameField.waitFor({ state: "visible" });
    await usernameField.fill(username);
    await TeacherPage.getPasswordInput(this.page).fill(password);
    await TeacherPage.getLoginBtn(this.page).click();

    await this.page.waitForURL("**/my/**", { timeout: 30000 });
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Step 2: confirm the dashboard is visible after login.
   * Asserts the <h1>Dashboard</h1> heading on /my/.
   */
  async verifyDashboardVisible() {
    await expect(TeacherPage.getDashboardHeading(this.page))
      .toBeVisible({ timeout: 15000 });
    await expect(this.page).toHaveURL(/\/my\/?/);
  }

  /**
   * TC-2 steps: open user menu and click Log out. Moodle redirects to the
   * homepage (config.lms.baseURL) — the spec asserts the final URL.
   */
  async logout() {
    await TeacherPage.getUserMenuBtn(this.page).click();
    const logout = TeacherPage.getLogoutLink(this.page);
    await logout.waitFor({ state: "visible", timeout: 10000 });
    await logout.click();
    await this.page.waitForLoadState("networkidle");
  }
}

module.exports = TeacherActions;
