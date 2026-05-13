const { chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const config = require("./config/env.config");

const STUDENT_AUTH_FILE = path.resolve(__dirname, ".auth/student.json");

async function globalSetup() {
  // Set once here so all Playwright workers share a single output file.
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  process.env.PLAYWRIGHT_RUN_TIMESTAMP =
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;

  const browser = await chromium.launch();

  // --- Admin / default user session ---
  const adminCtx = await browser.newContext();
  const adminPage = await adminCtx.newPage();
  try {
    await adminPage.goto(config.baseURL);
    await adminPage.getByPlaceholder("Username or email").fill(config.user2.username);
    await adminPage.getByPlaceholder("Password").fill(config.user2.password);
    await adminPage.getByRole("button", { name: "Log in" }).click();
    await adminPage.waitForURL("**/my/**", { timeout: 15000 });
    await adminCtx.storageState({ path: config.authStatePath });
    console.log("Authentication state saved successfully!");
  } catch (error) {
    console.error("Authentication setup failed:", error);
    throw error;
  } finally {
    await adminCtx.close();
  }

  // --- Student session (saved once, reused by all student projects) ---
  fs.mkdirSync(path.dirname(STUDENT_AUTH_FILE), { recursive: true });
  const studentCtx = await browser.newContext();
  const studentPage = await studentCtx.newPage();
  try {
    const loginURL = config.lms.baseURL.replace(/\/$/, "") + "/login/index.php";
    await studentPage.goto(loginURL, { waitUntil: "domcontentloaded" });
    await studentPage.locator("#username").fill(config.lms.student.email);
    await studentPage.locator("#password").fill(config.lms.student.password);
    await studentPage.locator("#loginbtn").click();
    await studentPage.waitForURL("**/my/**", { timeout: 30000 });
    await studentCtx.storageState({ path: STUDENT_AUTH_FILE });
    console.log("Student authentication state saved successfully!");
  } catch (error) {
    console.error("Student authentication setup failed:", error);
    throw error;
  } finally {
    await studentCtx.close();
  }

  await browser.close();
}

module.exports = globalSetup;
