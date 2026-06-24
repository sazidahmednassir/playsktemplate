// Authentication module — assertions only (POM). Logic in actions/AuthActions.
// result.for(...) is registered BEFORE assertions so a failing test still records
// a FAIL row (the fixture appends the error on teardown). result.note(...) enriches
// the detail on the success path.
const { test, expect } = require("./fixture/customfixture");
const cfg = require("../config/env.config");
const SHEET = "Authentication";

test.describe("Authentication", () => {
  test("AUTH-01 register a new renter with valid data", async ({ page, actions, result }) => {
    result.for(SHEET, "AUTH-01", "Registration completed and reached verification notice.");
    const email = `qa.auto.${Date.now()}@rentora.test`;
    await actions.auth.registerUser({ email });
    await expect(page).toHaveURL(/verify-email/);
    await expect(page.getByText(/Internal Server Error|UnsupportedSchemeException/i)).toHaveCount(0);
  });

  test("AUTH-02 registration submit must not return HTTP 500", async ({ page, actions, result }) => {
    result.for(SHEET, "AUTH-02", "Registration submission handled without server error.");
    const email = `qa.auto.${Date.now()}@rentora.test`;
    await actions.auth.registerUser({ email });
    const crashed = await page
      .getByText(/Internal Server Error|UnsupportedSchemeException|tls.*scheme is not supported/i)
      .count();
    expect(crashed, "Registration returned a 500 server error page").toBe(0);
  });

  test("AUTH-03 reject mismatched password confirmation", async ({ page, actions, result }) => {
    result.for(SHEET, "AUTH-03", "Mismatched confirmation blocked; stayed on register page.");
    const email = `qa.mm.${Date.now()}@rentora.test`;
    await actions.auth.registerUser({ email, password: "Password123!", confirm: "Different1!" });
    await expect(page).toHaveURL(/register/);
    await expect(page.getByText(/Internal Server Error/i)).toHaveCount(0);
  });

  test("AUTH-04 reject invalid email format", async ({ page, actions, result }) => {
    result.for(SHEET, "AUTH-04", "Invalid email rejected; remained on register page.");
    await actions.auth.registerUser({ email: "not-an-email" });
    await expect(page).toHaveURL(/register/);
  });

  test("AUTH-05 require Terms acceptance", async ({ page, actions, result }) => {
    result.for(SHEET, "AUTH-05", "Submission without Terms acceptance blocked.");
    const email = `qa.terms.${Date.now()}@rentora.test`;
    await actions.auth.registerUser({ email, acceptTerms: false });
    await expect(page).toHaveURL(/register/);
  });

  test("AUTH-08 login with valid owner credentials", async ({ page, actions, result }) => {
    result.for(SHEET, "AUTH-08", "Owner logged in and landed on /owner/dashboard.");
    await actions.auth.signInAsOwner();
    await expect(page).toHaveURL(/owner\/dashboard/);
  });

  test("AUTH-09 login with valid admin credentials", async ({ page, actions, result }) => {
    result.for(SHEET, "AUTH-09", "Admin logged in and landed on /admin/dashboard.");
    await actions.auth.signInAsAdmin();
    await expect(page).toHaveURL(/admin\/dashboard/);
  });

  test("AUTH-10 reject invalid password", async ({ page, actions, result }) => {
    result.for(SHEET, "AUTH-10", "Invalid password rejected with error; stayed on login.");
    await actions.auth.signIn(cfg.owner.username, "wrong-password-xyz");
    await expect(page).toHaveURL(/login/);
    await expect(page.getByText(/do not match our records|credentials/i)).toBeVisible();
  });

  test("AUTH-11 require email and password", async ({ page, actions, result }) => {
    result.for(SHEET, "AUTH-11", "Empty login submission blocked by validation.");
    await actions.auth.gotoLogin();
    await actions.auth.login.signInButton.click();
    await expect(page).toHaveURL(/login/);
  });

  test("AUTH-12 unverified renter gated at /verify-email", async ({ page, actions, result }) => {
    result.for(SHEET, "AUTH-12", "Unverified renter redirected to email-verification gate.");
    await actions.auth.signInAsRenter();
    await expect(page).toHaveURL(/verify-email/);
  });

  test("AUTH-13 logout terminates session", async ({ page, actions, result }) => {
    result.for(SHEET, "AUTH-13", "Logout ended session; protected route required login again.");
    await actions.auth.signInAsOwner();
    await expect(page).toHaveURL(/owner\/dashboard/);
    await actions.auth.logout();
    await actions.nav.goto("/owner/dashboard");
    await expect(page).toHaveURL(/login/);
  });
});
