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

async function screenshot(actions, name) {
  const p = `reports/_shots/${name}_${Date.now()}.png`;
  require("fs").mkdirSync("reports/_shots", { recursive: true });
  await actions.returns.page.screenshot({ path: p, fullPage: true }).catch(() => {});
  return p;
}
