// Search Filters module — assertions only (POM).
const { test, expect } = require("./fixture/customfixture");
const SearchPage = require("../pages/SearchPage");
const SHEET = "SearchFilters";

test.describe("Search Filters", () => {
  test("SRCH-01 price-range slider renders and is operable", async ({ page, actions, result }) => {
    result.for(SHEET, "SRCH-01", "Monthly Rent slider rendered as an operable range input.");
    const search = new SearchPage(page);
    await actions.nav.goto(search.path());
    await expect(search.priceHeading).toBeVisible();
    const sliders = await search.priceSliders.count();
    result.note(`Monthly Rent slider rendered ${sliders} range input(s).`);
    expect(sliders, "price range slider did not render").toBeGreaterThan(0);
  });

  test("SRCH-02 no JavaScript console errors on /search", async ({ page, actions, result }) => {
    result.for(SHEET, "SRCH-02", "No JavaScript console errors observed on /search.");
    const errors = actions.nav.attachConsoleCollector();
    const search = new SearchPage(page);
    await actions.nav.goto(search.path());
    await page.waitForLoadState("networkidle").catch(() => {}); // let Alpine initialise
    await expect(search.filtersHeading).toBeVisible();
    result.note(`Captured ${errors.length} console error(s) on /search.`);
    expect(errors, `console errors: ${errors.slice(0, 3).join(" || ")}`).toHaveLength(0);
  });
});
