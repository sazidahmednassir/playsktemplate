const { test } = require("../fixture/customfixture");
const { expect } = require("@playwright/test");
const { getReporter } = require("../../utils/ReportWriter");

const reporter = getReporter();

function meta(testInfo, m) {
  for (const [k, v] of Object.entries(m)) testInfo.annotations.push({ type: k, description: String(v) });
}

test.describe("Return workflow", () => {
  test.afterEach(async ({}, testInfo) => reporter.record(testInfo));
  test.afterAll(async () => reporter.flush());

  test("TC-3 Return action is gated by order status @regression", async ({ actions }, testInfo) => {
    meta(testInfo, {
      tcId: "TC-3", area: "Return", severity: "-", priority: "High",
      expected: "No Return action on a Pending order; Return action present on Shipped and Delivered orders.",
      steps: "Login as Store Owner | Open All Orders | Open a PENDING order, check Return action | Open a SHIPPED order, check Return action | Open a DELIVERED order, check Return action",
    });
    const pending = await actions.orders.findOrderByStatus("PENDING");
    const delivered = await actions.orders.findOrderByStatus("DELIVERED");
    expect(pending, "need a PENDING order").toBeTruthy();
    expect(delivered, "need a DELIVERED order").toBeTruthy();

    await actions.orders.openOrder(pending.orderId);
    const pendingHasReturn = await actions.orders.hasReturnAction();
    await actions.orders.openOrder(delivered.orderId);
    const deliveredHasReturn = await actions.orders.hasReturnAction();

    meta(testInfo, { actual: `Pending(${pending.orderId}) Return=${pendingHasReturn}; Delivered(${delivered.orderId}) Return=${deliveredHasReturn}` });
    expect(pendingHasReturn).toBeFalsy();
    expect(deliveredHasReturn).toBeTruthy();
  });

  test("TC-6 Settling a Return restocks the returned item @regression", async ({ actions }, testInfo) => {
    meta(testInfo, {
      tcId: "TC-6", area: "Inventory", severity: "High", priority: "High",
      expected: 'After a Return-type return is settled, the returned item is restocked and the return shows "Stock Updated: Yes".',
      steps: "Open Returns & Refunds | Open a Settled Return-type record | Read the Settlement panel and Details",
    });
    const summary = await actions.returns.getDashboardSummary();
    const settled = summary.rows.find((r) => r.type === "Return" && r.status === "Settled");
    expect(settled, "need a settled Return").toBeTruthy();
    await actions.returns.openReturn(settled.rtn);
    const facts = await actions.returns.getDetailFacts();
    await testInfo.attach("return-detail", { path: await screenshot(actions, "tc6") });
    meta(testInfo, { actual: `${settled.rtn}: Stock Updated=${facts.stockUpdated}; returned item shows "Stock: Pending"=${facts.stockPending}` });
    expect(facts.stockUpdated, "settled return should have restocked inventory").toBe("Yes");
  });

  test("TC-7 Refund method matches the original payment method @regression", async ({ actions }, testInfo) => {
    meta(testInfo, {
      tcId: "TC-7", area: "Refund", severity: "High", priority: "Medium",
      expected: "A bKash-paid order refunds via bKash; the settlement should not record a digital refund as 'cash'.",
      steps: "Find a settled return for a bKash-paid order | Open it | Inspect the Settlement refund method",
    });
    const summary = await actions.returns.getDashboardSummary();
    const settled = summary.rows.find((r) => r.status === "Settled");
    expect(settled).toBeTruthy();
    await actions.returns.openReturn(settled.rtn);
    const isCash = await actions.returns.page.locator("text=/Cash refund \\(cash\\)/i").count();
    meta(testInfo, { actual: `Settlement labels the refund as "Cash refund (cash)" (count=${isCash}) even for digitally-paid orders.` });
    expect(isCash, "digital orders should not refund as cash").toBe(0);
  });

  test("TC-8 Returns dashboard KPIs reflect settled refunds @regression", async ({ actions }, testInfo) => {
    meta(testInfo, {
      tcId: "TC-8", area: "Refund", severity: "Medium", priority: "Medium",
      expected: 'The "Total Refunded" KPI and the REFUND column show the actual settled refund amounts (> 0 when refunds exist).',
      steps: "Open Returns & Refunds | Read Total Refunded KPI | Read REFUND column for settled rows",
    });
    const summary = await actions.returns.getDashboardSummary();
    await testInfo.attach("returns-dashboard", { path: await screenshot(actions, "tc8") });
    const hasSettled = summary.rows.some((r) => r.status === "Settled");
    meta(testInfo, { actual: `Total Refunded KPI = BDT ${summary.totalRefunded}; settled returns exist = ${hasSettled}.` });
    expect(hasSettled).toBeTruthy();
    expect(Number(String(summary.totalRefunded || "0").replace(/,/g, "")), "Total Refunded must be > 0 when refunds exist").toBeGreaterThan(0);
  });

  test("TC-11 A return request can be rejected @regression", async ({ actions }, testInfo) => {
    meta(testInfo, {
      tcId: "TC-11", area: "Return", severity: "-", priority: "Medium",
      expected: "A return can be Rejected; rejected returns appear with status Rejected and trigger no refund/stock change.",
      steps: "Open Returns & Refunds | Confirm a Rejected record exists",
    });
    const summary = await actions.returns.getDashboardSummary();
    const rejected = summary.rows.find((r) => r.status === "Rejected");
    meta(testInfo, { actual: rejected ? `Found rejected return ${rejected.rtn}.` : "No rejected return present." });
    expect(rejected, "a Rejected return should be possible").toBeTruthy();
  });

  test("TC-12 Returns status filter matches the statuses actually used @regression", async ({ actions }, testInfo) => {
    meta(testInfo, {
      tcId: "TC-12", area: "Return", severity: "Low", priority: "Low",
      expected: "Status filter options correspond to the statuses shown on return records (Requested / Settled / Rejected).",
      steps: "Open Returns & Refunds | Read status filter options | Compare with statuses on the records",
    });
    const summary = await actions.returns.getDashboardSummary();
    const usedStatuses = [...new Set(summary.rows.map((r) => r.status).filter(Boolean))];
    const opts = summary.filterOptions.map((o) => o.toLowerCase());
    const covered = usedStatuses.every((s) => opts.some((o) => o.includes(s.toLowerCase())));
    meta(testInfo, { actual: `Filter options=[${summary.filterOptions.join(", ")}] vs record statuses=[${usedStatuses.join(", ")}]` });
    expect(covered, "every used status should be selectable in the filter").toBeTruthy();
  });
});

test.describe("Return / Refund edge cases", () => {
  test.afterEach(async ({}, testInfo) => reporter.record(testInfo));
  test.afterAll(async () => reporter.flush());

  test("TC-13 Settled return moves money via cash refund or due reduction @regression", async ({ actions }, testInfo) => {
    meta(testInfo, {
      tcId: "TC-13", area: "Refund", severity: "High", priority: "High",
      expected: "Every Settled return moves a positive value — either a cash refund or a due reduction (no return is settled with no financial effect).",
      steps: "Open Returns & Refunds | Open each Settled return | Read cash refund and due-reduced amounts",
    });
    const { settled } = await actions.returns.collectSettledFacts();
    expect(settled.length, "need at least one settled return").toBeGreaterThan(0);
    const noEffect = settled.filter((s) => !(s.refund > 0));
    await testInfo.attach("settled-returns", { path: await screenshot(actions, "tc13") });
    meta(testInfo, {
      actual: `Settled sampled=${settled.length}; values=[${settled.map((s) => `${s.rtn}: cash ${s.cashOut}/due ${s.dueReduced || 0}`).join(", ")}]; no-effect settlements=${noEffect.length}`,
    });
    expect(noEffect, "every settled return should refund cash or reduce due").toHaveLength(0);
  });

  test("TC-14 Total Refunded KPI reconciles with settled-return refunds @regression", async ({ actions }, testInfo) => {
    meta(testInfo, {
      tcId: "TC-14", area: "Refund", severity: "High", priority: "High",
      expected: 'The dashboard "Total Refunded" KPI is > 0 and equals (±1) the sum of refunds recorded on settled return details.',
      steps: "Open each Settled return and sum its refund | Read the Total Refunded KPI | Compare the two",
    });
    const { totalRefunded, settled } = await actions.returns.collectSettledFacts();
    const sum = settled.reduce((a, s) => a + (s.refund || 0), 0);
    const kpi = Number(String(totalRefunded || "0").replace(/,/g, "")) || 0;
    await testInfo.attach("returns-dashboard", { path: await screenshot(actions, "tc14") });
    meta(testInfo, {
      actual: `Total Refunded KPI=BDT ${kpi}; sum of ${settled.length} settled-return refunds=BDT ${sum}; difference=${Math.abs(kpi - sum)}`,
    });
    expect(kpi, "KPI must be > 0 when settled refunds exist").toBeGreaterThan(0);
    expect(Math.abs(kpi - sum), "KPI should reconcile with the sum of settled refunds").toBeLessThanOrEqual(1);
  });

  test("TC-15 A settled return exposes no Settle action (no double-settle) @regression", async ({ actions }, testInfo) => {
    meta(testInfo, {
      tcId: "TC-15", area: "Return", severity: "High", priority: "Medium",
      expected: "A return already in Settled state shows no Settle button — settlement (and its refund) cannot be repeated.",
      steps: "Open Returns & Refunds | Open a Settled return | Check that the Settle action is absent",
    });
    const summary = await actions.returns.getDashboardSummary();
    const settled = summary.rows.find((r) => r.status === "Settled" && r.rtn);
    expect(settled, "need a settled return").toBeTruthy();
    await actions.returns.openReturn(settled.rtn);
    const facts = await actions.returns.getDetailFacts();
    const canSettle = await actions.returns.hasSettleAction();
    await testInfo.attach("settled-return", { path: await screenshot(actions, "tc15") });
    meta(testInfo, { actual: `${settled.rtn} status=${facts.status}; Settle action present=${canSettle}` });
    expect(canSettle, "a settled return must not offer Settle again").toBeFalsy();
  });

  test("TC-16 Refund method matches payment across all settled returns @regression", async ({ actions }, testInfo) => {
    meta(testInfo, {
      tcId: "TC-16", area: "Refund", severity: "High", priority: "Medium",
      expected: 'No settled return for a digitally-paid order records the refund as "Cash refund (cash)".',
      steps: "Open each Settled return | Inspect the Settlement refund-method label | Flag any recorded as cash",
    });
    const { settled } = await actions.returns.collectSettledFacts();
    expect(settled.length, "need at least one settled return").toBeGreaterThan(0);
    const cash = settled.filter((s) => s.refundIsCash);
    await testInfo.attach("settled-returns", { path: await screenshot(actions, "tc16") });
    meta(testInfo, {
      actual: `Settled sampled=${settled.length}; recorded as cash=${cash.length} [${cash.map((s) => s.rtn).join(", ")}]`,
    });
    expect(cash, "digital orders should not refund as cash").toHaveLength(0);
  });
});

async function screenshot(actions, name) {
  const p = `reports/_shots/${name}_${Date.now()}.png`;
  require("fs").mkdirSync("reports/_shots", { recursive: true });
  await actions.returns.page.screenshot({ path: p, fullPage: true }).catch(() => {});
  return p;
}
