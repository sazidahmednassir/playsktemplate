const DashboardPage = require("../pages/DashboardPage");
const { expect } = require("@playwright/test");

class DashboardActions {
  constructor(page) {
    this.page = page;
  }

  async verifyDashboardLoaded() {
    await expect(DashboardPage.getDashboardHeading(this.page)).toBeVisible({
      timeout: 10000,
    });
  }

  async verifyQuickLaunchVisible() {
    const cards = DashboardPage.getQuickLaunchCards(this.page);
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  }

  async getQuickLaunchCount() {
    const cards = DashboardPage.getQuickLaunchCards(this.page);
    await cards.first().waitFor({ timeout: 10000 });
    return await cards.count();
  }

  async clickQuickLaunchCard(title) {
    const card = DashboardPage.getQuickLaunchByTitle(this.page, title);
    await card.waitFor({ state: "visible", timeout: 10000 });
    await card.click();
  }

  async verifyTimeAtWorkWidget() {
    await expect(DashboardPage.getTimeAtWorkWidget(this.page)).toBeVisible({
      timeout: 10000,
    });
  }

  async verifyMyActionsWidget() {
    await expect(DashboardPage.getMyActionsWidget(this.page)).toBeVisible({
      timeout: 10000,
    });
  }
}

module.exports = DashboardActions;
