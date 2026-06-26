// Boundary-Value-Analysis (BVA) + Equivalence-Partitioning (EP) module.
// Assertions only (POM); navigation/count logic lives in actions/SearchActions
// and actions/AuthActions. Expected counts are pinned to the live seed data
// (8 approved listings, rents 6,000..35,000 ৳). result.for(...) is registered
// BEFORE assertions so a failing test still records a FAIL row.
const { test, expect } = require("./fixture/customfixture");
const SHEET = "BoundaryEquivalence";

test.describe("Boundary Value Analysis & Equivalence Partitioning", () => {
  // --- min_price BVA (rent >= min, inclusive) ------------------------------
  test("BVA-01 min_price lower boundary keeps the cheapest listing", async ({ actions, result }) => {
    result.for(SHEET, "BVA-01", "min_price=6000 (inclusive lower boundary) returned all 8 listings.");
    await actions.search.gotoFiltered("min_price=6000");
    expect(await actions.search.resultCount()).toBe(8);
  });

  test("BVA-02 min_price boundary+1 drops the cheapest listing", async ({ actions, result }) => {
    result.for(SHEET, "BVA-02", "min_price=6001 excluded the ৳6,000 listing (7 remained).");
    await actions.search.gotoFiltered("min_price=6001");
    expect(await actions.search.resultCount()).toBe(7);
  });

  test("BVA-03 min_price upper boundary keeps only the dearest listing", async ({ actions, result }) => {
    result.for(SHEET, "BVA-03", "min_price=35000 kept only the ৳35,000 listing.");
    await actions.search.gotoFiltered("min_price=35000");
    expect(await actions.search.resultCount()).toBe(1);
  });

  test("BVA-04 min_price above maximum returns an empty set", async ({ actions, result }) => {
    result.for(SHEET, "BVA-04", "min_price=35001 returned 0 with a graceful empty state.");
    const status = await actions.search.gotoFiltered("min_price=35001");
    expect(status).toBe(200);
    expect(await actions.search.resultCount()).toBe(0);
    expect(await actions.search.hasEmptyState()).toBe(true);
  });

  // --- max_price BVA (rent <= max, inclusive) ------------------------------
  test("BVA-05 max_price lower boundary keeps only the cheapest listing", async ({ actions, result }) => {
    result.for(SHEET, "BVA-05", "max_price=6000 (inclusive) kept only the ৳6,000 listing.");
    await actions.search.gotoFiltered("max_price=6000");
    expect(await actions.search.resultCount()).toBe(1);
  });

  test("BVA-06 max_price boundary-1 returns an empty set", async ({ actions, result }) => {
    result.for(SHEET, "BVA-06", "max_price=5999 excluded every listing (0 results).");
    await actions.search.gotoFiltered("max_price=5999");
    expect(await actions.search.resultCount()).toBe(0);
  });

  test("BVA-07 max_price=0 is treated as 'no upper bound'", async ({ actions, result }) => {
    result.for(SHEET, "BVA-07", "max_price=0 was treated as no maximum; full catalogue (8) shown.");
    await actions.search.gotoFiltered("max_price=0");
    expect(await actions.search.resultCount()).toBe(8);
  });

  // --- bedrooms equivalence partitioning -----------------------------------
  test("EP-01 bedrooms=Any returns the full catalogue", async ({ actions, result }) => {
    result.for(SHEET, "EP-01", "bedrooms=Any returned all 8 listings.");
    await actions.search.gotoFiltered("bedrooms=");
    expect(await actions.search.resultCount()).toBe(8);
  });

  test("EP-02 bedrooms=1+ includes every listing", async ({ actions, result }) => {
    result.for(SHEET, "EP-02", "bedrooms=1 returned all 8 listings.");
    await actions.search.gotoFiltered("bedrooms=1");
    expect(await actions.search.resultCount()).toBe(8);
  });

  test("EP-03 bedrooms=2+ narrows the result set", async ({ actions, result }) => {
    result.for(SHEET, "EP-03", "bedrooms=2 returned 5 listings (>=2 bedrooms).");
    await actions.search.gotoFiltered("bedrooms=2");
    expect(await actions.search.resultCount()).toBe(5);
  });

  test("EP-04 bedrooms=3+ narrows the result set further", async ({ actions, result }) => {
    result.for(SHEET, "EP-04", "bedrooms=3 returned 3 listings (>=3 bedrooms).");
    await actions.search.gotoFiltered("bedrooms=3");
    expect(await actions.search.resultCount()).toBe(3);
  });

  test("EP-05 bedrooms=4+ keeps only the largest listings", async ({ actions, result }) => {
    result.for(SHEET, "EP-05", "bedrooms=4 returned 1 listing (>=4 bedrooms).");
    await actions.search.gotoFiltered("bedrooms=4");
    expect(await actions.search.resultCount()).toBe(1);
  });

  test("EP-06 bedrooms=5 (out-of-range) returns an empty set", async ({ actions, result }) => {
    result.for(SHEET, "EP-06", "bedrooms=5 (beyond offered partitions) returned 0, no crash.");
    const status = await actions.search.gotoFiltered("bedrooms=5");
    expect(status).toBe(200);
    expect(await actions.search.resultCount()).toBe(0);
  });

  // --- property-type equivalence partitioning ------------------------------
  test("EP-07 type=family returns only Family Flats", async ({ actions, result }) => {
    result.for(SHEET, "EP-07", "type[]=family returned 4 Family Flat listings.");
    await actions.search.gotoFiltered("type[]=family");
    expect(await actions.search.resultCount()).toBe(4);
  });

  // --- edge / robustness ----------------------------------------------------
  test("EDGE-01 inverted price range (min>max) returns an empty set", async ({ actions, result }) => {
    result.for(SHEET, "EDGE-01", "min_price>max_price returned 0 with HTTP 200, no crash.");
    const status = await actions.search.gotoFiltered("min_price=50000&max_price=10000");
    expect(status).toBe(200);
    expect(await actions.search.resultCount()).toBe(0);
  });

  test("EDGE-02 non-numeric min_price is ignored gracefully", async ({ page, actions, result }) => {
    result.for(SHEET, "EDGE-02", "min_price=abc was ignored; 8 listings shown, no server error.");
    const status = await actions.search.gotoFiltered("min_price=abc");
    expect(status).toBe(200);
    expect(await actions.search.resultCount()).toBe(8);
    await expect(page.getByText(/Internal Server Error|Whoops|Exception/i)).toHaveCount(0);
  });

  test("EDGE-03 negative min_price is ignored gracefully", async ({ actions, result }) => {
    result.for(SHEET, "EDGE-03", "min_price=-100 was ignored; 8 listings shown, HTTP 200.");
    const status = await actions.search.gotoFiltered("min_price=-100");
    expect(status).toBe(200);
    expect(await actions.search.resultCount()).toBe(8);
  });

  test("EDGE-04 no-match search term shows the empty state", async ({ actions, result }) => {
    result.for(SHEET, "EDGE-04", "q=Zzzzzz returned 0 with the 'No rentals found' empty state.");
    await actions.search.gotoFiltered("q=Zzzzzz");
    expect(await actions.search.resultCount()).toBe(0);
    expect(await actions.search.hasEmptyState()).toBe(true);
  });

  // --- register form BVA + EP (invalid input rejected before any mailer) ----
  test("BVA-08 password below 8-char minimum is rejected", async ({ page, actions, result }) => {
    result.for(SHEET, "BVA-08", "7-char password rejected with min-length error; stayed on /register; no 500.");
    const email = `bva.pw.${Date.now()}@rentora.test`;
    await actions.auth.registerUser({ email, phone: "01712345678", password: "Pass12!", confirm: "Pass12!" });
    await expect(page).toHaveURL(/register/);
    await expect(page.getByText(/must be at least 8 characters/i)).toBeVisible();
    await expect(page.getByText(/Internal Server Error|UnsupportedSchemeException/i)).toHaveCount(0);
  });

  test("EP-08 too-short phone partition is rejected", async ({ page, actions, result }) => {
    result.for(SHEET, "EP-08", "Phone '12345' rejected; stayed on /register; no 500.");
    const email = `ep.ph1.${Date.now()}@rentora.test`;
    await actions.auth.registerUser({ email, phone: "12345" });
    await expect(page).toHaveURL(/register/);
    await expect(page.getByText(/Internal Server Error|UnsupportedSchemeException/i)).toHaveCount(0);
  });

  test("EP-09 alphabetic phone partition is rejected", async ({ page, actions, result }) => {
    result.for(SHEET, "EP-09", "Phone 'abcdefghijk' rejected; stayed on /register; no 500.");
    const email = `ep.ph2.${Date.now()}@rentora.test`;
    await actions.auth.registerUser({ email, phone: "abcdefghijk" });
    await expect(page).toHaveURL(/register/);
    await expect(page.getByText(/Internal Server Error|UnsupportedSchemeException/i)).toHaveCount(0);
  });
});
