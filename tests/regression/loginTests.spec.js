const { test } = require("../fixture/customfixture");
const config = require("../../config/env.config");

test.describe("Login Tests", () => {
  test("User can login with valid credentials and land on dashboard", async ({
    browser,
    actions,
  }) => {
    await actions.login.loginWithoutStoredState(
      browser,
      config.baseURL,
      config.user2.username,
      config.user2.password,
    );
  });

  test("User is on dashboard after using stored auth state", async ({
    actions,
  }) => {
    await actions.login.ensureLoggedIn(
      config.baseURL,
      config.user2.username,
      config.user2.password,
    );
    await actions.login.verifyNotOnLoginPage();
  });
});
