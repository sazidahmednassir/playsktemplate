const { test } = require("../fixture/customfixture");
const config = require("../../config/env.config");

test.describe("Sidebar Navigation Tests", () => {
  test.beforeEach(async ({ actions }) => {
    await actions.login.ensureLoggedIn(
      config.baseURL,
      config.user2.username,
      config.user2.password,
    );
  });

  test("Sidebar is visible after login", async ({ actions }) => {
    await actions.navigation.verifySidebarVisible();
  });

  test("User can navigate to Admin module", async ({ actions }) => {
    await actions.navigation.navigateToModule("Admin");
    await actions.navigation.verifyOnModule("Admin");
  });

  test("User can navigate to PIM module", async ({ actions }) => {
    await actions.navigation.navigateToModule("PIM");
    await actions.navigation.verifyOnModule("PIM");
  });

  test("User can navigate to Leave module", async ({ actions }) => {
    await actions.navigation.navigateToModule("Leave");
    await actions.navigation.verifyOnModule("Leave");
  });

  test("User can navigate to Directory module", async ({ actions }) => {
    await actions.navigation.navigateToModule("Directory");
    await actions.navigation.verifyOnModule("Directory");
  });
});
