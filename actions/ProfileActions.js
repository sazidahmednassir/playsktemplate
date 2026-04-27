const ProfilePage = require("../pages/ProfilePage");
const { expect } = require("@playwright/test");

class ProfileActions {
  constructor(page) {
    this.page = page;
  }

  /**
   * Open the user profile dropdown menu in the top-right corner
   * Step 1: Click user dropdown → ProfilePage.getUserDropdown → page.locator(".oxd-userdropdown")
   * This reveals menu items: Logout, About, Change Password, Support
   */
  async openUserDropdown() {
    await ProfilePage.getUserDropdown(this.page).click();
  }

  /**
   * Verify the dropdown menu is open by checking if "Logout" link is visible
   * Step 1: Get Logout link → ProfilePage.getLogoutLink → page.getByRole("menuitem", { name: "Logout" })
   * Step 2: Assert it is visible with 5s timeout
   */
  async verifyDropdownOpen() {
    await expect(ProfilePage.getLogoutLink(this.page)).toBeVisible({
      timeout: 5000,
    });
  }

  /**
   * Full logout flow — open dropdown, click Logout, wait for redirect
   * Used by: signOutTests.spec.js → logout and session invalidation tests
   * Step 1: Click user dropdown → ProfilePage.getUserDropdown → page.locator(".oxd-userdropdown")
   * Step 2: Click "Logout" menu item → ProfilePage.getLogoutLink → page.getByRole("menuitem", { name: "Logout" })
   * Step 3: Wait for page to finish loading (networkidle) → page redirects to /login
   */
  async logout() {
    await this.openUserDropdown();
    await ProfilePage.getLogoutLink(this.page).click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Verify the username is visible in the top-right dropdown area
   * Step 1: Get username text → ProfilePage.getUserDropdownName → page.locator(".oxd-userdropdown-name")
   * Step 2: Assert it is visible with 5s timeout
   */
  async verifyUserName() {
    const name = ProfilePage.getUserDropdownName(this.page);
    await expect(name).toBeVisible({ timeout: 5000 });
  }
}

module.exports = ProfileActions;
