const TenantSwitchPage = require("../pages/tenantSwitchPage");
const { expect } = require("@playwright/test");

class TenantSwitchActions {
  constructor(page) {
    this.page = page;
  }

  async clickProfileMenu() {
    await this.page.waitForLoadState("networkidle");
    await TenantSwitchPage.getProfileButton(this.page).click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  async clickCustomerDropdown(customerName) {
    await TenantSwitchPage.getCustomerDropdown(this.page, customerName).click();
    await this.page.waitForTimeout(1000);
  }

  async switchToTenant(tenantName) {
    const tenantItem = TenantSwitchPage.getTenantItem(this.page, tenantName);
    await tenantItem.hover();
    await this.page.waitForTimeout(500);
    await TenantSwitchPage.getSwitchButton(this.page).click();
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(2000);
  }

  async verifyTenantSelected(customerName, tenantName) {
    await this.clickProfileMenu();
    await this.clickCustomerDropdown(customerName);
    const tenantItem = TenantSwitchPage.getTenantItem(this.page, tenantName);
    await expect(tenantItem).toBeVisible({ timeout: 10000 });
  }
}

module.exports = TenantSwitchActions;
