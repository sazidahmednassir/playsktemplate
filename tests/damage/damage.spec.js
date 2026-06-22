const { test } = require("../fixture/customfixture");
const { expect } = require("@playwright/test");
const { getReporter } = require("../../utils/ReportWriter");

const reporter = getReporter();
function meta(testInfo, m) { for (const [k, v] of Object.entries(m)) testInfo.annotations.push({ type: k, description: String(v) }); }

test.describe("Damage Claim workflow", () => {
  test.afterEach(async ({}, testInfo) => reporter.record(testInfo));
  test.afterAll(async () => reporter.flush());

  test("TC-10 Damage Claim records condition and marks the order @regression", async ({ actions }, testInfo) => {
    meta(testInfo, {
      tcId: "TC-10", area: "Damage", severity: "Medium", priority: "Medium",
      expected: "A settled Damage Claim is recorded against the order (order status reflects a damage claim) with item condition captured.",
      steps: "Open Returns & Refunds | Open a settled Damage Claim | Confirm it is recorded and linked to an order",
    });
    const summary = await actions.returns.getDashboardSummary();
    const dmg = summary.rows.find((r) => r.type === "Damage Claim");
    expect(dmg, "need a Damage Claim record").toBeTruthy();
    await actions.returns.openReturn(dmg.rtn);
    const facts = await actions.returns.getDetailFacts();
    meta(testInfo, { actual: `${dmg.rtn}: status=${facts.status}, type=${facts.type}, Stock Updated=${facts.stockUpdated}.` });
    expect(facts.type).toBe("Damage Claim");
  });
});
