const DashboardPage = require("../pages/DashboardPage");
const { expect } = require("@playwright/test");

class DashboardActions {
  constructor(page) {
    this.page = page;
  }

  /**
   * Verify the "Dashboard" heading is visible on the page
   * Step 1: Get dashboard heading → DashboardPage.getDashboardHeading → page.locator(".oxd-topbar-header-breadcrumb", { hasText: "Dashboard" })
   * Step 2: Assert it is visible with 10s timeout
   */
  async verifyDashboardLoaded() {
    await expect(DashboardPage.getDashboardHeading(this.page)).toBeVisible({
      timeout: 10000,
    });
  }

  /**
   * Verify at least one Quick Launch shortcut card is visible
   * Step 1: Get all quick launch cards → DashboardPage.getQuickLaunchCards → page.locator(".orangehrm-quick-launch-card")
   * Step 2: Assert the first card is visible with 10s timeout
   */
  async verifyQuickLaunchVisible() {
    const cards = DashboardPage.getQuickLaunchCards(this.page);
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  }

  /**
   * Count the total number of Quick Launch cards on the dashboard
   * Step 1: Get all quick launch cards → DashboardPage.getQuickLaunchCards → page.locator(".orangehrm-quick-launch-card")
   * Step 2: Wait for first card to appear (ensures cards are loaded)
   * Step 3: Return the total count of matching cards
   * @returns {number} Total number of Quick Launch cards
   */
  async getQuickLaunchCount() {
    const cards = DashboardPage.getQuickLaunchCards(this.page);
    await cards.first().waitFor({ timeout: 10000 });
    return await cards.count();
  }

  /**
   * Click a specific Quick Launch card by its title text
   * @param {string} title - Card title to click (e.g., "Assign Leave", "Leave List", "Timesheets")
   * Step 1: Find card by title → DashboardPage.getQuickLaunchByTitle → page.locator(".orangehrm-quick-launch-card", { hasText: title })
   * Step 2: Wait for the card to be visible with 10s timeout
   * Step 3: Click the card → navigates to the corresponding module page
   */
  async clickQuickLaunchCard(title) {
    const card = DashboardPage.getQuickLaunchByTitle(this.page, title);
    await card.waitFor({ state: "visible", timeout: 10000 });
    await card.click();
  }

  /**
   * Verify the "Time at Work" widget is visible on the dashboard
   * Step 1: Get widget → DashboardPage.getTimeAtWorkWidget → page.locator(".oxd-grid-item.orangehrm-dashboard-widget").filter({ hasText: "Time at Work" }).first()
   * Step 2: Assert it is visible with 10s timeout
   */
  async verifyTimeAtWorkWidget() {
    await expect(DashboardPage.getTimeAtWorkWidget(this.page)).toBeVisible({
      timeout: 10000,
    });
  }

  /**
   * Verify the "My Actions" widget is visible on the dashboard
   * Step 1: Get widget → DashboardPage.getMyActionsWidget → page.locator(".oxd-grid-item.orangehrm-dashboard-widget").filter({ hasText: "My Actions" }).first()
   * Step 2: Assert it is visible with 10s timeout
   */
  async verifyMyActionsWidget() {
    await expect(DashboardPage.getMyActionsWidget(this.page)).toBeVisible({
      timeout: 10000,
    });
  }
}

module.exports = DashboardActions;
