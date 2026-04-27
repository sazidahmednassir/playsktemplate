const SidebarPage = require("../pages/SidebarPage");
const { expect } = require("@playwright/test");

class NavigationActions {
  constructor(page) {
    this.page = page;
  }

  /**
   * Verify the left sidebar navigation panel is visible
   * Step 1: Get sidebar → SidebarPage.getSidebar → page.locator(".oxd-sidepanel")
   * Step 2: Assert it is visible with 10s timeout
   */
  async verifySidebarVisible() {
    await expect(SidebarPage.getSidebar(this.page)).toBeVisible({
      timeout: 10000,
    });
  }

  /**
   * Click a module menu item in the sidebar to navigate to that module
   * Used by: navigationTests.spec.js → Admin, PIM, Leave, Directory tests
   * @param {string} moduleName - Module name to click (e.g., "Admin", "PIM", "Leave", "Directory")
   * Step 1: Find menu item by name → SidebarPage.getMenuItemByName → page.locator(".oxd-main-menu-item", { hasText: moduleName })
   * Step 2: Click the menu item → navigates to the module page
   * Step 3: Wait for page to finish loading (networkidle) → SPA route change completes
   */
  async navigateToModule(moduleName) {
    const menuItem = SidebarPage.getMenuItemByName(this.page, moduleName);
    await menuItem.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Verify the breadcrumb shows the expected module name after navigation
   * @param {string} moduleName - Expected module name in breadcrumb (e.g., "Admin", "PIM")
   * Step 1: Find breadcrumb with module text → page.locator(".oxd-topbar-header-breadcrumb", { hasText: moduleName })
   * Step 2: Assert it is visible with 10s timeout → confirms page navigated correctly
   */
  async verifyOnModule(moduleName) {
    const breadcrumb = this.page.locator(".oxd-topbar-header-breadcrumb", {
      hasText: moduleName,
    });
    await expect(breadcrumb).toBeVisible({ timeout: 10000 });
  }

  /**
   * Type search text into the sidebar search input to filter menu items
   * @param {string} searchText - Text to type in the search box
   * Step 1: Get search input → SidebarPage.getSearchInput → page.locator(".oxd-main-menu-search input")
   * Step 2: Fill the search text → filters sidebar menu items in real-time
   */
  async searchSidebar(searchText) {
    await SidebarPage.getSearchInput(this.page).fill(searchText);
  }
}

module.exports = NavigationActions;
