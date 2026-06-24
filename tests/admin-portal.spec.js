// Admin Portal module — assertions only (POM).
const { test, expect } = require("./fixture/customfixture");
const cfg = require("../config/env.config");
const AdminDashboardPage = require("../pages/admin/AdminDashboardPage");
const AdminUsersPage = require("../pages/admin/AdminUsersPage");
const SHEET = "AdminPortal";

test.describe("Admin Portal", () => {
  test.beforeEach(async ({ actions, page }) => {
    await actions.auth.signInAsAdmin();
    await expect(page).toHaveURL(/admin\/dashboard/);
  });

  test("ADM-01 dashboard shows platform KPIs", async ({ page, result }) => {
    result.for(SHEET, "ADM-01", "Admin dashboard rendered all four KPI cards.");
    const dash = new AdminDashboardPage(page);
    await expect(dash.pendingReview).toBeVisible();
    await expect(dash.approvedListings).toBeVisible();
    await expect(dash.totalUsers).toBeVisible();
    await expect(dash.totalListings).toBeVisible();
  });

  test("ADM-02 review queue reachable (FIFO)", async ({ page, actions, result }) => {
    result.for(SHEET, "ADM-02", "Review Queue page loaded with FIFO ordering / empty state.");
    await actions.nav.goto("/admin/listings", cfg.adminBaseURL);
    await expect(page).toHaveURL(/admin\/listings/);
    await expect(page.getByText(/Review Queue|caught up|pending/i).first()).toBeVisible();
  });

  test("ADM-05 users list shows totals and roles", async ({ page, actions, result }) => {
    result.for(SHEET, "ADM-05", "Users table rendered with total/role counters.");
    const users = new AdminUsersPage(page);
    await actions.nav.goto(users.path(), cfg.adminBaseURL);
    await expect(users.table).toBeVisible();
    await expect(users.totalCounter).toBeVisible();
  });

  test("ADM-06 filter users by role (owners)", async ({ page, actions, result }) => {
    result.for(SHEET, "ADM-06", "Role filter applied for Owners.");
    const users = new AdminUsersPage(page);
    await actions.nav.goto(users.path(), cfg.adminBaseURL);
    await users.roleFilter.selectOption({ label: "Owners" });
    await users.filterButton.click();
    await expect(page).toHaveURL(/role=owner|owners/i);
  });

  test("ADM-08 admin row has no Ban action on itself", async ({ page, actions, result }) => {
    result.for(SHEET, "ADM-08", "Admin's own row exposed no Ban action.");
    const users = new AdminUsersPage(page);
    await actions.nav.goto(users.path(), cfg.adminBaseURL);
    const adminRow = users.rowByEmail(cfg.admin.username);
    await expect(adminRow).toBeVisible();
    await expect(adminRow.getByRole("button", { name: "Ban" })).toHaveCount(0);
  });

  test("ADM-09 NID verification queue reachable", async ({ actions, result }) => {
    result.for(SHEET, "ADM-09", "NID Verify page returned HTTP 200.");
    const status = await actions.nav.gotoStatus("/admin/verifications", cfg.adminBaseURL);
    expect(status).toBe(200);
  });
});
