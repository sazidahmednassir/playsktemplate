const DashboardPage = require("../pages/DashboardPage");

class BaseActions {
  /**
   * Navigate to any URL
   * @param {object} page - Playwright page instance
   * @param {string} url - Target URL to navigate to
   * Step 1: Go to the given URL → page.goto(url)
   */
  static async navigate(page, url) {
    await page.goto(url);
  }

  /**
   * Navigate to a URL and verify user is authenticated (dashboard loaded)
   * @param {object} page - Playwright page instance
   * @param {string} url - Target URL to navigate to
   * Step 1: Go to the given URL → page.goto(url)
   * Step 2: Wait for dashboard heading → DashboardPage.getDashboardHeading → page.locator(".oxd-topbar-header-breadcrumb", { hasText: "Dashboard" })
   */
  static async navigateAndVerifyAuth(page, url) {
    await page.goto(url);
    await DashboardPage.getDashboardHeading(page).waitFor({ timeout: 10000 });
  }
}

module.exports = BaseActions;
