// Access Control + Security modules — assertions only (POM).
const { test, expect } = require("./fixture/customfixture");
const cfg = require("../config/env.config");
const PropertyDetailPage = require("../pages/PropertyDetailPage");

const SAMPLE_SLUG = "3-bed-family-flat-in-mirpur-10-8550";

test.describe("Access Control", () => {
  const RBAC = "AccessControl";

  test("RBAC-01 guest cannot access owner dashboard", async ({ page, actions, result }) => {
    result.for(RBAC, "RBAC-01", "Guest hitting /owner/dashboard was redirected to login.");
    await actions.nav.goto("/owner/dashboard");
    await expect(page).toHaveURL(/login/);
  });

  test("RBAC-02 guest cannot access admin dashboard", async ({ page, actions, result }) => {
    result.for(RBAC, "RBAC-02", "Guest hitting /admin/dashboard was redirected to login.");
    await actions.nav.goto("/admin/dashboard", cfg.adminBaseURL);
    await expect(page).toHaveURL(/login/);
  });

  test("RBAC-03 owner cannot access admin portal", async ({ page, actions, result }) => {
    result.for(RBAC, "RBAC-03", "Owner session blocked from the admin area.");
    await actions.auth.signInAsOwner();
    await expect(page).toHaveURL(/owner\/dashboard/);
    const status = await actions.nav.gotoStatus("/admin/dashboard");
    const onAdmin = /\/admin\/dashboard/.test(page.url());
    const denied = status === 403 || /login/.test(page.url()) || !onAdmin;
    result.note(`Owner blocked from admin area (status ${status}).`);
    expect(denied, `owner reached admin area (status ${status}, url ${page.url()})`).toBeTruthy();
  });

  test("RBAC-05 admin routes require auth (no data leak)", async ({ page, actions, result }) => {
    result.for(RBAC, "RBAC-05", "Guest hitting /admin/users redirected to login; no table leaked.");
    await actions.nav.goto("/admin/users", cfg.adminBaseURL);
    await expect(page).toHaveURL(/login/);
    await expect(page.getByRole("table")).toHaveCount(0);
  });
});

test.describe("Security", () => {
  const SEC = "Security";

  test("SEC-01 contact details require authentication", async ({ page, actions, result }) => {
    result.for(SEC, "SEC-01", "Owner PII gated behind login for guests.");
    const detail = new PropertyDetailPage(page);
    await actions.nav.goto(detail.path(SAMPLE_SLUG));
    await expect(detail.phoneHidden).toBeVisible();
    await expect(detail.anyPhone).toHaveCount(0);
  });

  test("SEC-02 registration error must not leak stack traces", async ({ page, actions, result }) => {
    result.for(SEC, "SEC-02", "Registration failure page exposed no stack trace / PII.");
    const email = `qa.sec.${Date.now()}@rentora.test`;
    await actions.auth.registerUser({ email });
    const leaked = await page
      .getByText(/vendor\/symfony|UnsupportedSchemeException|RegisteredUserController|Stack trace|EsmtpTransportFactory/i)
      .count();
    expect(leaked, "framework stack trace / file paths exposed to user").toBe(0);
  });
});
