const LoginPage = require("../pages/LoginPage");
const DashboardPage = require("../pages/DashboardPage");
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
    await LoginPage.getUsernameInput(this.page).fill(username);
    await LoginPage.getPasswordInput(this.page).fill(password);
    await LoginPage.getLoginBtn(this.page).click();
  }

  async validLogin(username, password) {
    await this.login(username, password);
    await DashboardPage.getDashboardHeading(this.page).waitFor({
      timeout: 10000,
    });
  }

  async verifyDashboardVisible() {
    const heading = DashboardPage.getDashboardHeading(this.page);
    await expect(heading).toBeVisible({ timeout: 10000 });
  }

  async verifyNotOnLoginPage() {
    await expect(this.page).not.toHaveURL(/login/);
  }

  async loginWithoutStoredState(browser, url, username, password) {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    try {
      await page.goto(url);
      await page.getByPlaceholder("Username").fill(username);
      await page.getByPlaceholder("Password").fill(password);
      await page.getByRole("button", { name: "Login" }).click();

      await page
        .locator(".oxd-topbar-header-breadcrumb", { hasText: "Dashboard" })
        .waitFor({ timeout: 10000 });
      await expect(
        page.locator(".oxd-topbar-header-breadcrumb", { hasText: "Dashboard" }),
      ).toBeVisible();
      await expect(page).not.toHaveURL(/login/);
    } finally {
      await context.close();
    }
  }

  async verifyLoggedIn() {
    await DashboardPage.getDashboardHeading(this.page).waitFor({
      timeout: 10000,
    });
    await expect(DashboardPage.getDashboardHeading(this.page)).toBeVisible();
  }

  async ensureLoggedIn(url, username, password) {
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
    await this.page.waitForLoadState("networkidle").catch(() => {});

    // If session expired and we landed on login page, re-login
    if (this.page.url().includes("login")) {
      await LoginPage.getUsernameInput(this.page).fill(username);
      await LoginPage.getPasswordInput(this.page).fill(password);
      await LoginPage.getLoginBtn(this.page).click();
      await DashboardPage.getDashboardHeading(this.page).waitFor({
        timeout: 15000,
      });
    }
  }

  async verifyOnLoginPage() {
    await expect(this.page).toHaveURL(/login/);
  }

  async verifyLoginErrorVisible() {
    const errorMsg = LoginPage.getErrorMessage(this.page);
    await expect(errorMsg).toBeVisible({ timeout: 10000 });
  }

  async verifyRequiredFieldError() {
    const requiredError = LoginPage.getRequiredError(this.page);
    await expect(requiredError.first()).toBeVisible({ timeout: 5000 });
  }

  async loginAndExpectFailure(browser, url, username, password) {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: "networkidle" });
      await page.getByPlaceholder("Username").waitFor({ timeout: 15000 });
      await page.getByPlaceholder("Username").fill(username);
      await page.getByPlaceholder("Password").fill(password);
      await page.getByRole("button", { name: "Login" }).click();

      const errorMsg = page.locator(".oxd-alert-content--error, .oxd-alert--error");
      await expect(errorMsg.first()).toBeVisible({ timeout: 15000 });
    } finally {
      await context.close();
    }
  }

  async loginWithEmptyFields(browser, url) {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    try {
      await page.goto(url);
      await page.getByPlaceholder("Username").waitFor({ timeout: 10000 });
      await page.getByRole("button", { name: "Login" }).click();

      const requiredErrors = page.locator(".oxd-input-field-error-message");
      await expect(requiredErrors.first()).toBeVisible({ timeout: 10000 });
    } finally {
      await context.close();
    }
  }
}

module.exports = LoginActions;
