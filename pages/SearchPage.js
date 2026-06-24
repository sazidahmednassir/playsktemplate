// SearchPage — locators only (POM).
class SearchPage {
  constructor(page) {
    this.page = page;
    this.searchBox = page.getByRole("textbox", { name: /Search city, area, property type/i });
    this.searchButton = page.getByRole("button", { name: "Search" });
    this.resultCount = page.getByText(/rentals found/i);
    this.gridButton = page.getByRole("button", { name: "Grid" });
    this.mapButton = page.getByRole("button", { name: "Map" });
    this.sortBy = page.getByRole("combobox", { name: "Sort by" });
    this.filtersHeading = page.getByRole("heading", { name: "Filters", exact: true });

    // Filter controls
    this.typeFamilyFlat = page.getByRole("checkbox", { name: "Family Flat" });
    this.bedrooms3Plus = page.getByRole("radio", { name: "3+" });
    this.priceHeading = page.getByRole("heading", { name: /Monthly Rent/i });
    // The dual-handle price slider (inputs of type=range) — broken on current build.
    this.priceSliders = page.locator('input[type="range"]');

    this.resultCards = page.locator('a[href*="/properties/"]');
    this.cityCardLocation = page.locator('a[href*="/properties/"] >> text=/Dhaka City/');
  }

  path() {
    return "/search";
  }
}

module.exports = SearchPage;
