// AdminCreateListingPage — locators only (POM). Admin "Add Listing" form,
// focused on the Photos section (placeholder toggle + Cloudinary-backed upload).
class AdminCreateListingPage {
  constructor(page) {
    this.page = page;

    // Photos section
    this.photosHeading = page.getByRole("heading", { name: "Photos", level: 2 });
    // Single switch on the form: "Use placeholder image instead" (default ON).
    this.placeholderToggle = page.getByRole("switch");
    // Dropzone label appears only when the placeholder toggle is OFF.
    this.dropzone = page.getByText(/Drop photos here or browse/i);
    this.fileInput = page.locator('input[type="file"]');
    this.uploadCounter = page.getByText(/\d+\s*\/\s*20 uploaded/i);
    this.cloudinaryError = page.getByText(/Image uploads require Cloudinary configuration/i);

    // Submit
    this.createButton = page.getByRole("button", { name: "Create Listing" });
  }

  path() {
    return "/admin/listings/create";
  }
}

module.exports = AdminCreateListingPage;
