const { chromium } = require("@playwright/test");
require("dotenv").config();

async function globalSetup() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to OrangeHRM login page
    await page.goto(process.env.BASE_URL);

    // Perform login
    await page.getByPlaceholder("Username").fill(process.env.USER2_EMAIL);
    await page.getByPlaceholder("Password").fill(process.env.USER2_PASSWORD);
    await page.getByRole("button", { name: "Login" }).click();

    // Wait for successful login - dashboard heading
    await page
      .locator(".oxd-topbar-header-breadcrumb")
      .waitFor({ timeout: 15000 });

    // Save the authenticated state
    await context.storageState({ path: process.env.AUTH_STATE_PATH });

    console.log("Authentication state saved successfully!");
  } catch (error) {
    console.error("Authentication setup failed:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = globalSetup;
