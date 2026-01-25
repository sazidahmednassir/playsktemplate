const { test } = require("../fixture/customfixture");
const loginData = require("../../data/loginData.json");

test.describe("Login Tests", () => {
  test.beforeEach(async ({ actions }) => {
    await actions.login.navigateToLogin(loginData.url);
  });

  test("User can login with valid credentials and land on homepage - User 2", async ({
    actions,
  }) => {
    await actions.login.validLogin(
      loginData.user2.email,
      loginData.user2.password,
    );
    await actions.login.verifyHomepageVisible();
    await actions.login.verifyNotOnLoginPage();
  });
});
