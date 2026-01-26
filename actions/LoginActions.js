const LoginPage = require("../pages/LoginPage");
const { expect } = require("@playwright/test");
const BaseActions = require("./BaseActions");

class LoginActions {
  constructor(page) {
    this.page = page;
  }

  async navigateToLogin(url) {
    await BaseActions.navigate(this.page, url);
  }

  async login(username, password) {
    // Step 1: Enter email and click Continue
    await LoginPage.getUsername(this.page).fill(username);
    await LoginPage.getContinueBtn(this.page).click();

    // Step 2: Enter password and click Continue
    await LoginPage.getPassword(this.page).fill(password);
    await LoginPage.getContinueBtn(this.page).click();
  }

  async validLogin(username, password) {
    await this.login(username, password);
    await LoginPage.getHomePageIdentifier(this.page).waitFor({
      timeout: 10000,
    });
  }

  async verifyHomepageVisible() {
    const homePage = LoginPage.getHomePageIdentifier(this.page);
    await expect(homePage).toBeVisible({ timeout: 10000 });
  }

  async verifyNotOnLoginPage() {
    await expect(this.page).not.toHaveURL(/login/);
  }

  async loginWithoutStoredState(browser, url, username, password) {
    // Create a new context without stored auth state
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    try {
      await page.goto(url);

      // Perform login
      await page.locator("#username").fill(username);
      await page.getByRole("button", { name: "Continue" }).click();
      await page.getByRole("textbox", { name: "Password" }).fill(password);
      await page.getByRole("button", { name: "Continue" }).click();

      // Verify homepage is visible
      await page
        .getByRole("heading", { name: "(Beta Version)" })
        .waitFor({ timeout: 10000 });
      await expect(
        page.getByRole("heading", { name: "(Beta Version)" }),
      ).toBeVisible();

      // Verify not on login page
      await expect(page).not.toHaveURL(/login/);
    } finally {
      await context.close();
    }
  }

  async verifyLoggedIn() {
    await LoginPage.getHomePageIdentifier(this.page).waitFor({
      timeout: 10000,
    });
    await expect(LoginPage.getHomePageIdentifier(this.page)).toBeVisible();
  }
}

module.exports = LoginActions;
