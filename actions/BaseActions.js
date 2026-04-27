const DashboardPage = require("../pages/DashboardPage");

class BaseActions {
  static async navigate(page, url) {
    await page.goto(url);
  }

  static async navigateAndVerifyAuth(page, url) {
    await page.goto(url);
    await DashboardPage.getDashboardHeading(page).waitFor({ timeout: 10000 });
  }
}

module.exports = BaseActions;
