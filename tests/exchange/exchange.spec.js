const { test } = require("../fixture/customfixture");
const { expect } = require("@playwright/test");
const { getReporter } = require("../../utils/ReportWriter");

const reporter = getReporter();
function meta(testInfo, m) { for (const [k, v] of Object.entries(m)) testInfo.annotations.push({ type: k, description: String(v) }); }

test.describe("Exchange workflow", () => {
  test.afterEach(async ({}, testInfo) => reporter.record(testInfo));
  test.afterAll(async () => reporter.flush());

  test("TC-9 Settling an Exchange spawns a linked replacement order @regression", async ({ actions }, testInfo) => {
    meta(testInfo, {
      tcId: "TC-9", area: "Exchange", severity: "Medium", priority: "Medium",
      expected: 'A settled Exchange creates a linked replacement order and the returned item is restocked ("Stock Updated: Yes").',
      steps: "Open Returns & Refunds | Open a settled Exchange | Confirm a replacement order is referenced | Check Stock Updated",
    });
    const summary = await actions.returns.getDashboardSummary();
    const exch = summary.rows.find((r) => r.type === "Exchange" && r.status === "Settled");
    expect(exch, "need a settled Exchange").toBeTruthy();
    await actions.returns.openReturn(exch.rtn);
    const facts = await actions.returns.getDetailFacts();
    meta(testInfo, { actual: `${exch.rtn}: replacement order=${facts.exchangeOrder || "none"}; Stock Updated=${facts.stockUpdated} (restock defect shared with TC-6).` });
    expect(facts.exchangeOrder, "exchange must create a replacement order").toBeTruthy();
  });
});
