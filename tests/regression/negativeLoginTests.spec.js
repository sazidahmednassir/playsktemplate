const { test } = require("../fixture/customfixture");
const config = require("../../config/env.config");

test.describe("Negative Login Tests", () => {
  test("Login fails with invalid password", async ({ browser, actions }) => {
    await actions.login.loginAndExpectFailure(
      browser,
      config.baseURL,
      config.user2.username,
      "wrongPassword123",
    );
  });

  test("Login fails with invalid username", async ({ browser, actions }) => {
    await actions.login.loginAndExpectFailure(
      browser,
      config.baseURL,
      "invalidUser",
      config.user2.password,
    );
  });

  test("Login fails with empty fields showing required errors", async ({
    browser,
    actions,
  }) => {
    await actions.login.loginWithEmptyFields(browser, config.baseURL);
  });
});
