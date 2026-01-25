const ProfilePage = require("../pages/ProfilePage");
const { expect } = require("@playwright/test");

class ProfileActions {
  constructor(page) {
    this.page = page;
  }

  async clickProfileMenu() {
    await this.page.waitForLoadState("networkidle");
    await ProfilePage.getProfileButton(this.page).click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  async clickCustomerDropdown(customerName) {
    await ProfilePage.getCustomerDropdown(this.page, customerName).click();
    await this.page.waitForTimeout(1000);
  }

  async switchToTenant(tenantName) {
    const tenantItem = ProfilePage.getTenantItem(this.page, tenantName);
    await tenantItem.hover();
    await this.page.waitForTimeout(500);
    await ProfilePage.getSwitchButton(this.page).click();
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(2000);
  }

  async verifyTenantSelected(customerName, tenantName) {
    await this.clickProfileMenu();
    await this.clickCustomerDropdown(customerName);
    const tenantItem = ProfilePage.getTenantItem(this.page, tenantName);
    await expect(tenantItem).toBeVisible({ timeout: 10000 });
  }
}

module.exports = ProfileActions;
