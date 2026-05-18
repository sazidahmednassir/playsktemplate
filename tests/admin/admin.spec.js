const { test } = require("../fixture/customfixture");
const { expect } = require("@playwright/test");
const config = require("../../config/env.config");
const { getWriter } = require("../../utils/ExcelResultWriter");

// Admin | Proctoring Pro — all TCs from the "Admin" tab of excel/Proctoring Pro.xlsx.
// Per codebase-rules §2: one spec per Excel tab. Inline comments only, no JSDoc.
//
// Launch profile (empty storage state, no fake media) lives in
// playwright.config.js as the `admin-login` project. Each test title carries
// the @admin tag so the project's grep selects it.

const TC_BY_TITLE = {
  "TC-1 Admin logs in and sees the Dashboard @admin": {
    sheet: "Admin", tcId: 1,
    passDetail: "The admin saw the dashboard after login (Dashboard heading visible at /my/).",
  },
  "TC-2 Admin logs out and is redirected to homepage @admin": {
    sheet: "Admin", tcId: 2,
    passDetail: "The admin logged out from the user menu and was redirected to the homepage at https://education.elearning23.com/.",
  },
};

test.describe("Admin | Proctoring Pro", () => {
  test.afterEach(async ({}, testInfo) => {
    const meta = TC_BY_TITLE[testInfo.title];
    if (!meta) return;

    const status =
      testInfo.status === "passed"
        ? "PASS"
        : testInfo.status === "skipped"
          ? "SKIP"
          : "FAIL";

    let detail;
    if (status === "PASS") {
      detail = meta.passDetail || "Test passed.";
    } else if (status === "SKIP") {
      detail = "SKIPPED";
    } else {
      const parts = ["FAIL"];
      if (testInfo.error?.message) parts.push(`— ${testInfo.error.message}`);
      const screenshot = testInfo.attachments.find((a) => a.name === "screenshot");
      if (screenshot?.path) parts.push(`Screenshot: ${screenshot.path}`);
      detail = parts.join(" ");
    }

    try {
      const out = getWriter().write({
        sheet: meta.sheet,
        tcId: meta.tcId,
        status,
        detail,
      });
      console.log(`[ExcelResultWriter] wrote TC-${meta.tcId} (${status}) → ${out}`);
    } catch (e) {
      console.error(`[ExcelResultWriter] failed for TC-${meta.tcId}:`, e.message);
    }
  });

  test("TC-1 Admin logs in and sees the Dashboard @admin", async ({ actions, page }) => {
    await actions.admin.loginAsAdmin(
      config.lms.baseURL,
      config.lms.admin.username,
      config.lms.admin.password,
    );
    await actions.admin.verifyDashboardVisible();

    // Final sanity assertion: page title contains "Dashboard".
    await expect(page).toHaveTitle(/dashboard/i);
  });

  test("TC-2 Admin logs out and is redirected to homepage @admin", async ({ actions, page }) => {
    await actions.admin.loginAsAdmin(
      config.lms.baseURL,
      config.lms.admin.username,
      config.lms.admin.password,
    );
    await actions.admin.logout();

    // Expected per Excel: homepage URL https://education.elearning23.com/
    await expect(page).toHaveURL(config.lms.baseURL);
  });
});
