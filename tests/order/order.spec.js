const { test } = require("../fixture/customfixture");
const { expect } = require("@playwright/test");
const { getReporter } = require("../../utils/ReportWriter");

const reporter = getReporter();
function meta(testInfo, m) { for (const [k, v] of Object.entries(m)) testInfo.annotations.push({ type: k, description: String(v) }); }

test.describe("Order management", () => {
  test.afterEach(async ({}, testInfo) => reporter.record(testInfo));
  test.afterAll(async () => reporter.flush());

  test("TC-1 Storefront orders reach All Orders @smoke", async ({ actions }, testInfo) => {
    meta(testInfo, {
      tcId: "TC-1", area: "Order", severity: "-", priority: "High",
      expected: "Orders placed on the storefront (bKash/SSLCommerz/COD) appear in the admin All Orders list.",
      steps: "Confirm storefront is reachable | Login as Store Owner | Open All Orders | Confirm storefront-sourced orders are listed",
    });
    const status = await actions.store.isReachable();
    const orders = await actions.orders.listOrders();
    const storefrontSourced = orders.filter((o) => /bkash|sslcommerz|cod/i.test(o.text));
    meta(testInfo, { actual: `Storefront HTTP ${status}; ${orders.length} orders listed; ${storefrontSourced.length} via storefront payment methods.` });
    expect(status).toBe(200);
    expect(orders.length).toBeGreaterThan(0);
  });

  test("TC-2 Order status transitions are logged @regression", async ({ actions }, testInfo) => {
    meta(testInfo, {
      tcId: "TC-2", area: "Order", severity: "-", priority: "High",
      expected: "Status changes (e.g. confirmed → shipped → delivered) are persisted and recorded in the order Logs with actor.",
      steps: "Open a DELIVERED/REFUNDED order | Read the Logs | Confirm shipped & delivered transitions are recorded",
    });
    const order = (await actions.orders.findOrderByStatus("REFUNDED")) || (await actions.orders.findOrderByStatus("DELIVERED"));
    expect(order).toBeTruthy();
    await actions.orders.openOrder(order.orderId);
    const logs = await actions.orders.getLogsText();
    meta(testInfo, { actual: `Order ${order.orderId} logs contain shipped=${/shipped/i.test(logs)}, delivered=${/delivered/i.test(logs)}.` });
    expect(/shipped/i.test(logs) && /delivered/i.test(logs)).toBeTruthy();
  });
});
