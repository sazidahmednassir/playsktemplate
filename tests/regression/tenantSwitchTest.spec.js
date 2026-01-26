const { test } = require("../fixture/customfixture");
const config = require("../../config/env.config");

test.describe("Tenant Switch Tests", () => {
  test.beforeEach(async ({ actions }) => {
    await actions.login.navigateToLogin(config.baseURL);
    await actions.login.verifyLoggedIn();
  });

  test("User can switch tenant from Hailbuton to AkerBP and verify selection", async ({
    actions,
  }) => {
    await actions.tenantSwitch.clickProfileMenu();
    await actions.tenantSwitch.clickCustomerDropdown("AkerBP");
    await actions.tenantSwitch.switchToTenant("default");
    await actions.tenantSwitch.verifyTenantSelected("AkerBP", "default");
  });
});
