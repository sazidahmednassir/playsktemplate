class BaseActions {
  static async navigate(page, url) {
    await page.goto(url);
  }

  static async navigateAndVerifyAuth(page, url) {
    await page.goto(url);
    // Verify we're logged in
    await page
      .getByRole("heading", { name: "(Beta Version)" })
      .waitFor({ timeout: 10000 });
  }
}

module.exports = BaseActions;
