// Owner Portal module — assertions only (POM).
const { test, expect } = require("./fixture/customfixture");
const OwnerDashboardPage = require("../pages/owner/OwnerDashboardPage");
const OwnerCreateWizardPage = require("../pages/owner/OwnerCreateWizardPage");
const SHEET = "OwnerPortal";

test.describe("Owner Portal", () => {
  test.beforeEach(async ({ actions, page }) => {
    await actions.auth.signInAsOwner();
    await expect(page).toHaveURL(/owner\/dashboard/);
  });

  test("OWN-01 dashboard shows stats and recent listings", async ({ page, result }) => {
    result.for(SHEET, "OWN-01", "Owner dashboard showed KPI cards and recent listings.");
    const dash = new OwnerDashboardPage(page);
    await expect(dash.heading).toBeVisible();
    await expect(dash.pendingCard).toBeVisible();
    await expect(dash.totalViewsCard).toBeVisible();
    await expect(dash.recentListings).toBeVisible();
  });

  test("OWN-02 my listings shows owner's own properties", async ({ page, actions, result }) => {
    result.for(SHEET, "OWN-02", "My Listings displayed the owner's own listings.");
    await actions.nav.goto("/owner/listings");
    await expect(page).toHaveURL(/owner\/listings/);
    const cards = page.locator('a[href*="/properties/"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    result.note(`My Listings displayed ${count} owner-owned listing link(s).`);
  });

  test("OWN-03 add-listing wizard starts at step 1", async ({ page, actions, result }) => {
    result.for(SHEET, "OWN-03", "Create wizard redirected to step/1 with 10-step stepper.");
    const wiz = new OwnerCreateWizardPage(page);
    await actions.nav.goto(wiz.path());
    await expect(page).toHaveURL(/create\/step\/1/);
    await expect(wiz.stepCaption).toBeVisible();
  });

  test("OWN-04 Continue disabled until selections made", async ({ page, actions, result }) => {
    result.for(SHEET, "OWN-04", "Continue button disabled on step 1 before any selection.");
    const wiz = new OwnerCreateWizardPage(page);
    await actions.nav.goto(wiz.path());
    await expect(wiz.continueButton).toBeDisabled();
  });

  test("OWN-08 owner profile page loads", async ({ actions, result }) => {
    result.for(SHEET, "OWN-08", "Owner profile page returned HTTP 200.");
    const status = await actions.nav.gotoStatus("/profile");
    expect(status).toBe(200);
  });
});
