const { test } = require("../fixture/customfixture");
const loginData = require("../../data/loginData.json");

test.describe("Profile Tests", () => {
  test.beforeEach(async ({ actions }) => {
    await actions.login.navigateToLogin(loginData.url);
    await actions.login.validLogin(
      loginData.user2.email,
      loginData.user2.password,
    );
    await actions.login.verifyHomepageVisible();
  });

  test("User can switch tenant from Hailbuton to AkerBP and verify selection", async ({
    actions,
  }) => {
    // Click profile menu
    await actions.profile.clickProfileMenu();

    // Click on AkerBP dropdown to reveal tenant list
    await actions.profile.clickCustomerDropdown("AkerBP");

    // Switch to default tenant
    await actions.profile.switchToTenant("default");

    // Verify default tenant is now selected
    await actions.profile.verifyTenantSelected("AkerBP", "default");
  });
});
