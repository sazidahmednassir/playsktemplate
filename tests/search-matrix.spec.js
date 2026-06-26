// Search Filter Matrix — exhaustive EP/BVA/edge over /search filter params.
// Data-driven from data/search-matrix.json (counts pinned to the live seed via
// the matrix probe). Assertions only; navigation/counting live in SearchActions.
const { test, expect } = require("./fixture/customfixture");
const { SEARCH_MATRIX } = require("../data/testcases");
const SHEET = "SearchMatrix";

test.describe("Search Filter Matrix (EP / BVA / edge)", () => {
  for (const m of SEARCH_MATRIX) {
    test(`${m.id} ${m.label}`, async ({ actions, result }) => {
      result.for(SHEET, m.id, `${m.params} returned ${m.expectedCount} listing(s).`);
      await actions.search.gotoFiltered(m.params);
      expect(await actions.search.resultCount(), `filter ${m.params}`).toBe(m.expectedCount);
    });
  }
});
