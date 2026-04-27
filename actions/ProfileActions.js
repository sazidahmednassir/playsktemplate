const ProfilePage = require("../pages/ProfilePage");
const { expect } = require("@playwright/test");

class ProfileActions {
  constructor(page) {
    this.page = page;
  }

  async openUserDropdown() {
    await ProfilePage.getUserDropdown(this.page).click();
  }

  async verifyDropdownOpen() {
    await expect(ProfilePage.getLogoutLink(this.page)).toBeVisible({
      timeout: 5000,
    });
  }

  async logout() {
    await this.openUserDropdown();
    await ProfilePage.getLogoutLink(this.page).click();
    await this.page.waitForLoadState("networkidle");
  }

  async verifyUserName() {
    const name = ProfilePage.getUserDropdownName(this.page);
    await expect(name).toBeVisible({ timeout: 5000 });
  }
}

module.exports = ProfileActions;
