const { chromium } = require("@playwright/test");
require("dotenv").config();

async function globalSetup() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login page
    await page.goto(process.env.BASE_URL);

    // Perform login
    await page.locator("#username").fill(process.env.USER2_EMAIL);
    await page.getByRole("button", { name: "Continue" }).click();

    // Wait for password field and fill it
    await page
      .getByRole("textbox", { name: "Password" })
      .fill(process.env.USER2_PASSWORD);
    await page.getByRole("button", { name: "Continue" }).click();

    // Wait for successful login - homepage identifier
    await page
      .getByRole("heading", { name: "(Beta Version)" })
      .waitFor({ timeout: 15000 });

    // Save the authenticated state
    await context.storageState({ path: process.env.AUTH_STATE_PATH });

    console.log("✅ Authentication state saved successfully!");
  } catch (error) {
    console.error("❌ Authentication setup failed:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = globalSetup;
