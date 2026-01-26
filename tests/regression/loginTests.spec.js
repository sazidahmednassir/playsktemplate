const { test } = require("../fixture/customfixture");
const config = require("../../config/env.config");

test.describe("Login Tests", () => {
  // Test without stored auth to verify fresh login works
  test("User can login with valid credentials and land on homepage - User 2", async ({
    browser,
    actions,
  }) => {
    await actions.login.loginWithoutStoredState(
      browser,
      config.baseURL,
      config.user2.email,
      config.user2.password,
    );
  });

  // Test using stored authentication state
  test("User can switch tenant from Hailbuton to AkerBP and verify selection", async ({
    actions,
  }) => {
    await actions.login.navigateToLogin(config.baseURL);
    await actions.login.verifyLoggedIn();

    await actions.tenantSwitch.clickProfileMenu();
    await actions.tenantSwitch.clickCustomerDropdown("AkerBP");
    await actions.tenantSwitch.switchToTenant("default");
    await actions.tenantSwitch.verifyTenantSelected("AkerBP", "default");
  });
});
