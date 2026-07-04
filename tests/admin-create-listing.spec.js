// Admin Create Listing — Photos section. Assertions only (POM).
// Covers the Cloudinary-not-configured upload defect (BUG-007) and the
// default-ON placeholder toggle that hides the uploader.
const path = require("path");
const { test, expect } = require("./fixture/customfixture");
const cfg = require("../config/env.config");
const AdminCreateListingPage = require("../pages/admin/AdminCreateListingPage");

const SHEET = "AdminPortal";
// A valid landscape PNG well under the 10MB limit.
const IMAGE = path.join(__dirname, "..", "docs", "screenshots", "03_dashboard.png");

test.describe("Admin Create Listing — Photos", () => {
  test.beforeEach(async ({ actions, page }) => {
    await actions.auth.signInAsAdmin();
    await expect(page).toHaveURL(/admin\/dashboard/);
  });

  // App defect (BUG-007): the upload endpoint returns 501 because the server has
  // no Cloudinary credentials. This test asserts the DESIRED behaviour, so it
  // fails as living evidence until the env is configured.
  test("ADM-10 admin photo upload succeeds (no Cloudinary 501)", async ({ page, actions, result }) => {
    result.for(SHEET, "ADM-10", "Uploaded a valid landscape image via the admin Create Listing dropzone.");
    const create = new AdminCreateListingPage(page);
    await actions.nav.goto(create.path(), cfg.adminBaseURL);

    // Reveal the uploader (placeholder toggle is ON by default).
    await create.placeholderToggle.click();
    await expect(create.dropzone).toBeVisible();

    const [resp] = await Promise.all([
      page.waitForResponse((r) => /\/images\/upload/.test(r.url())),
      create.fileInput.setInputFiles(IMAGE),
    ]);

    expect(resp.status(), "image upload endpoint must not return 501").toBe(200);
    await expect(create.cloudinaryError).toHaveCount(0);
  });

  // Current behaviour (passes): documents that the dropzone is hidden until the
  // default-ON placeholder switch is turned off.
  test("ADM-11 uploader is hidden behind the default-ON placeholder toggle", async ({ page, actions, result }) => {
    result.for(SHEET, "ADM-11", "Placeholder toggle defaulted ON; dropzone appeared only after switching it OFF.");
    const create = new AdminCreateListingPage(page);
    await actions.nav.goto(create.path(), cfg.adminBaseURL);

    // On load: switch is ON and the upload control is not shown.
    await expect(create.placeholderToggle).toBeChecked();
    await expect(create.dropzone.first()).toBeHidden();

    // Turning it off reveals the dropzone.
    await create.placeholderToggle.click();
    await expect(create.placeholderToggle).not.toBeChecked();
    await expect(create.dropzone.first()).toBeVisible();
  });
});
