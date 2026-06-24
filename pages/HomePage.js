// HomePage — locators only (POM).
class HomePage {
  constructor(page) {
    this.page = page;
    this.brand = page.getByRole("link", { name: "Rentora" }).first();
    this.browseNav = page.getByRole("link", { name: "Browse" });
    this.loginLink = page.getByRole("link", { name: "Log in" });
    this.signupLink = page.getByRole("link", { name: "Sign up" });
    this.heroHeading = page.getByRole("heading", { name: "Rent with confidence" });
    this.heroLocation = page.getByRole("textbox", { name: /Dhaka, Mirpur, Gulshan/i });
    this.heroTypeSelect = page.getByRole("combobox");
    this.heroSearchButton = page.getByRole("button", { name: "Search" });
    this.browseByCity = page.getByRole("heading", { name: "Browse by city" });
    this.howItWorks = page.getByRole("heading", { name: "How Rentora works" });
    this.latestListings = page.getByRole("heading", { name: "Latest listings" });
    this.listingCards = page.locator('a[href*="/properties/"]');
  }

  path() {
    return "/";
  }
}

module.exports = HomePage;
