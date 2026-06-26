// Custom Playwright fixture for the Rentora suite.
// Per CLAUDE.md every spec MUST require this fixture.
//
// Provides:
//   actions  -> { auth, nav }            business-logic action classes
//   result   -> recorder that writes the Actual Result column of
//               excel/Rentora-Testcases.xlsx on test teardown, using the
//               final test status (passed/failed/skipped).

const base = require("@playwright/test");
const AuthActions = require("../../actions/AuthActions");
const NavActions = require("../../actions/NavActions");
const SearchActions = require("../../actions/SearchActions");
const { getWriter } = require("../../utils/RentoraResultWriter");

const test = base.test.extend({
  actions: async ({ page }, use) => {
    await use({
      auth: new AuthActions(page),
      nav: new NavActions(page),
      search: new SearchActions(page),
    });
  },

  result: async ({}, use, testInfo) => {
    const state = { sheet: null, tcId: null, detail: "" };
    const recorder = {
      // Call once per test: which Excel sheet + TC ID this test maps to,
      // and a past-tense detail describing the observed outcome.
      for(sheet, tcId, detail = "") {
        state.sheet = sheet;
        state.tcId = tcId;
        state.detail = detail;
        return recorder;
      },
      note(detail) {
        state.detail = detail;
        return recorder;
      },
    };

    await use(recorder);

    if (state.sheet && state.tcId) {
      const status =
        testInfo.status === "passed"
          ? "PASS"
          : testInfo.status === "skipped"
            ? "SKIP"
            : "FAIL";
      let detail = state.detail;
      if (status === "FAIL" && testInfo.error) {
        detail = `${detail} | ${(testInfo.error.message || "").split("\n")[0]}`.trim();
      }
      try {
        getWriter().write({ sheet: state.sheet, tcId: state.tcId, status, detail });
      } catch (e) {
        console.error(`[RentoraResultWriter] ${state.tcId}: ${e.message}`);
      }
    }
  },
});

module.exports = { test, expect: base.expect };
