// Guest Browsing module — assertions only (POM).
const { test, expect } = require("./fixture/customfixture");
const HomePage = require("../pages/HomePage");
const SearchPage = require("../pages/SearchPage");
const PropertyDetailPage = require("../pages/PropertyDetailPage");
const SHEET = "GuestBrowsing";

const SAMPLE_SLUG = "3-bed-family-flat-in-mirpur-10-8550";

test.describe("Guest Browsing", () => {
  test("GUEST-01 home page renders core sections", async ({ page, actions, result }) => {
    result.for(SHEET, "GUEST-01", "Home rendered hero, city, how-it-works and latest listings.");
    const home = new HomePage(page);
    await actions.nav.goto(home.path());
    await expect(home.heroHeading).toBeVisible();
    await expect(home.browseByCity).toBeVisible();
    await expect(home.howItWorks).toBeVisible();
    await expect(home.latestListings).toBeVisible();
  });

  test("GUEST-02 hero search redirects to results", async ({ page, actions, result }) => {
    result.for(SHEET, "GUEST-02", "Hero search navigated to /search with query.");
    const home = new HomePage(page);
    await actions.nav.goto(home.path());
    await home.heroLocation.fill("Mirpur");
    await home.heroSearchButton.click();
    await expect(page).toHaveURL(/search/);
  });

  test("GUEST-03 search lists all approved listings", async ({ page, actions, result }) => {
    result.for(SHEET, "GUEST-03", "Search page listed the approved catalogue.");
    const search = new SearchPage(page);
    await actions.nav.goto(search.path());
    await expect(search.resultCount).toBeVisible();
    const count = await search.resultCards.count();
    expect(count).toBeGreaterThanOrEqual(8);
    result.note(`Search page listed ${count} approved properties.`);
  });

  test("GUEST-04 property-type quick filter (family)", async ({ page, actions, result }) => {
    result.for(SHEET, "GUEST-04", "type=family returned Family Flat listings.");
    const search = new SearchPage(page);
    await actions.nav.goto("/search?type[]=family");
    const count = await search.resultCards.count();
    expect(count).toBeGreaterThan(0);
    result.note(`type=family returned ${count} Family Flat listings.`);
  });

  test("GUEST-05 property detail renders full info", async ({ page, actions, result }) => {
    result.for(SHEET, "GUEST-05", "Property detail showed specs, amenities and owner block.");
    const detail = new PropertyDetailPage(page);
    await actions.nav.goto(detail.path(SAMPLE_SLUG));
    await expect(detail.title).toBeVisible();
    await expect(detail.aboutHeading).toBeVisible();
    await expect(detail.amenitiesHeading).toBeVisible();
    await expect(detail.listedByHeading).toBeVisible();
  });

  test("GUEST-06 owner phone/address hidden from guests", async ({ page, actions, result }) => {
    result.for(SHEET, "GUEST-06", "Guest saw 'phone & address hidden'; no PII exposed.");
    const detail = new PropertyDetailPage(page);
    await actions.nav.goto(detail.path(SAMPLE_SLUG));
    await expect(detail.phoneHidden).toBeVisible();
    await expect(detail.loginToContact).toBeVisible();
    await expect(detail.anyPhone).toHaveCount(0);
  });

  test("GUEST-08 city landing page loads", async ({ actions, result }) => {
    result.for(SHEET, "GUEST-08", "City page /rent-in/dhaka returned HTTP 200.");
    const status = await actions.nav.gotoStatus("/rent-in/dhaka");
    expect(status).toBe(200);
  });

  test("GUEST-09 breadcrumb city slug resolves (not 404)", async ({ actions, result }) => {
    result.for(SHEET, "GUEST-09", "Breadcrumb slug /rent-in/dhaka-city resolved.");
    const status = await actions.nav.gotoStatus("/rent-in/dhaka-city");
    expect(status, "breadcrumb city slug should not 404").toBe(200);
    result.note(`Breadcrumb slug /rent-in/dhaka-city returned HTTP ${status}.`);
  });

  test("GUEST-11 invalid property slug returns 404", async ({ actions, result }) => {
    result.for(SHEET, "GUEST-11", "Unknown property slug returned HTTP 404.");
    const status = await actions.nav.gotoStatus("/properties/does-not-exist-9999");
    expect(status).toBe(404);
  });
});
