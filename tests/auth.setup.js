const { test: setup } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const config = require("../config/env.config");

const AUTH = config.authDir;
fs.mkdirSync(AUTH, { recursive: true });

async function attempt(page, email, password) {
  await page.goto(config.admin.loginURL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#email", { timeout: 30000 });
  await page.waitForTimeout(2000); // let React hydrate so submit hits the handler, not a native GET
  await page.fill("#email", email);
  await page.fill("#password", password);
  const terms = page.locator("#terms");
  if ((await terms.count()) && !(await terms.isChecked())) await terms.check().catch(() => {});
  const [resp] = await Promise.all([
    page.waitForResponse((r) => /auth\/staff\/login/i.test(r.url()), { timeout: 30000 }).catch(() => null),
    page.locator('button[type=submit]').click(),
  ]);
  await page.waitForURL("**/shop/**/dashboard**", { timeout: 30000 }).catch(() => {});
  return resp && resp.status();
}

async function staffLogin(page, email, password, file) {
  let status = await attempt(page, email, password);
  if (!/dashboard/.test(page.url())) status = await attempt(page, email, password); // one retry for the hydration race
  if (!/dashboard/.test(page.url())) throw new Error(`staff login failed (auth status=${status}, url=${page.url()})`);
  await page.context().storageState({ path: path.join(AUTH, file) });
}

setup("authenticate store owner", async ({ page }) => {
  await staffLogin(page, config.admin.owner.email, config.admin.owner.password, "owner.json");
});

setup("authenticate admin user", async ({ page }) => {
  if (!config.admin.adminUser.email) return;
  await staffLogin(page, config.admin.adminUser.email, config.admin.adminUser.password, "admin.json").catch(() => {});
});
