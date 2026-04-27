const SidebarPage = require("../pages/SidebarPage");
const { expect } = require("@playwright/test");

class NavigationActions {
  constructor(page) {
    this.page = page;
  }

  async verifySidebarVisible() {
    await expect(SidebarPage.getSidebar(this.page)).toBeVisible({
      timeout: 10000,
    });
  }

  async navigateToModule(moduleName) {
    const menuItem = SidebarPage.getMenuItemByName(this.page, moduleName);
    await menuItem.click();
    await this.page.waitForLoadState("networkidle");
  }

  async verifyOnModule(moduleName) {
    const breadcrumb = this.page.locator(".oxd-topbar-header-breadcrumb", {
      hasText: moduleName,
    });
    await expect(breadcrumb).toBeVisible({ timeout: 10000 });
  }

  async searchSidebar(searchText) {
    await SidebarPage.getSearchInput(this.page).fill(searchText);
  }
}

module.exports = NavigationActions;
