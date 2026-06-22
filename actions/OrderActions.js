const OrdersPage = require("../pages/OrdersPage");
const config = require("../config/env.config");

const STATUS_RE = /\b(PENDING|CONFIRMED|SHIPPED|DELIVERED|RETURNED|REFUNDED|CANCELLED|DAMAGED|EXCHANGE)\b/i;

class OrderActions {
  constructor(page) {
    this.page = page;
    this.orders = new OrdersPage(page);
  }

  async openAllOrders() {
    await this.page.goto(config.admin.path("orders"), { waitUntil: "domcontentloaded" });
    await this.orders.getRows().first().waitFor({ timeout: 60000 });
  }

  // Returns [{ orderId, status, text }] for the current page.
  async listOrders() {
    await this.openAllOrders();
    return this.page.evaluate(() => {
      return [...document.querySelectorAll("table tbody tr")].map((tr) => {
        const a = tr.querySelector('a[href*="/orders/view/"]');
        const id = a ? a.getAttribute("href").split("/").pop() : null;
        const text = tr.innerText.replace(/\s+/g, " ").trim();
        const m = text.match(/\b(PENDING|CONFIRMED|SHIPPED|DELIVERED|RETURNED|REFUNDED|CANCELLED|DAMAGED|EXCHANGE)\b/i);
        return id ? { orderId: id, status: m ? m[1].toUpperCase() : "?", text } : null;
      }).filter(Boolean);
    });
  }

  async findOrderByStatus(status) {
    const rows = await this.listOrders();
    return rows.find((r) => r.status === status.toUpperCase()) || null;
  }

  async openOrder(orderId) {
    await this.page.goto(config.admin.path(`orders/view/${orderId}`), { waitUntil: "domcontentloaded" });
    await this.page.waitForTimeout(4000);
  }

  async getOrderStatus() {
    const body = await this.page.locator("body").innerText();
    const m = body.match(STATUS_RE);
    return m ? m[1].toUpperCase() : "?";
  }

  // True when the order exposes a Return action (gating: Shipped/Delivered only).
  async hasReturnAction() {
    const btn = this.page.getByRole("button", { name: /^Return$/ });
    return (await btn.count()) > 0 && (await btn.first().isVisible().catch(() => false));
  }

  async clickReturnAction() {
    await this.page.getByRole("button", { name: /^Return$/ }).first().click();
    await this.page.waitForTimeout(3000);
  }

  async getLogsText() {
    return this.page.evaluate(() => {
      const h = [...document.querySelectorAll("h1,h2,h3")].find((e) => /Logs/i.test(e.innerText));
      return h ? (h.parentElement?.innerText || "").replace(/\s+/g, " ").trim() : "";
    });
  }
}
module.exports = OrderActions;
