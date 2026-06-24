// PropertyDetailPage — locators only (POM).
class PropertyDetailPage {
  constructor(page) {
    this.page = page;
    this.title = page.getByRole("heading", { level: 1 });
    this.breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
    this.breadcrumbCity = this.breadcrumb.getByRole("link", { name: /Dhaka City/i });
    this.aboutHeading = page.getByRole("heading", { name: "About this property" });
    this.amenitiesHeading = page.getByRole("heading", { name: "Amenities", exact: true });
    this.listedByHeading = page.getByRole("heading", { name: "Listed by" });

    // Guest contact gating
    this.loginToContact = page.getByRole("link", { name: /Log in to contact owner/i });
    this.createFreeAccount = page.getByRole("link", { name: /Create free account/i });
    this.phoneHidden = page.getByText(/Phone & address hidden/i);
    // Bangladeshi phone pattern, used to assert NO phone is shown to guests.
    this.anyPhone = page.getByText(/(\+8801|01)\d{9}/);
  }

  path(slug) {
    return `/properties/${slug}`;
  }
}

module.exports = PropertyDetailPage;
