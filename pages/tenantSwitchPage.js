const TenantSwitchPage = {
  getProfileButton: (page) => page.locator("button:has(img.user-avatar-img)"),
  getCustomerDropdown: (page, customerName) =>
    page.locator("div.customer-info", { hasText: customerName }),
  getTenantItem: (page, tenantName) =>
    page.locator("div.tenant-info", {
      has: page.locator(`span.tenant-name`, { hasText: tenantName }),
    }),
  getSwitchButton: (page) => page.locator('button:has-text("Switch")'),
  getSignOutButton: (page) => page.getByRole("menuitem", { name: "Sign out" }),
};

module.exports = TenantSwitchPage;
