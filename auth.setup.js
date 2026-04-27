const { chromium } = require("@playwright/test");
const config = require("./config/env.config");

async function globalSetup() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(config.baseURL);

    await page.getByPlaceholder("Username").fill(config.user2.username);
    await page.getByPlaceholder("Password").fill(config.user2.password);
    await page.getByRole("button", { name: "Login" }).click();

    await page
      .locator(".oxd-topbar-header-breadcrumb")
      .waitFor({ timeout: 15000 });

    await context.storageState({ path: config.authStatePath });

    console.log("Authentication state saved successfully!");
  } catch (error) {
    console.error("Authentication setup failed:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = globalSetup;
