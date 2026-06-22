// Locators only — All Orders list + single order detail view.
class OrdersPage {
  constructor(page) {
    this.page = page;
  }
  // List
  getSearchInput() { return this.page.locator('input[placeholder*="Search Orders" i]'); }
  getRows() { return this.page.locator("table tbody tr"); }
  getViewLinkFor(orderId) { return this.page.locator(`a[href*="/orders/view/${orderId}"]`); }

  // Detail
  getStatusBadge() { return this.page.locator("text=/^(PENDING|CONFIRMED|SHIPPED|DELIVERED|RETURNED|REFUNDED|CANCELLED|DAMAGED|EXCHANGE)$/i").first(); }
  getReturnAction() { return this.page.getByRole("button", { name: /^Return$/ }).or(this.page.getByRole("link", { name: /^Return$/ })); }
  getFulfillmentPanel() { return this.page.locator("text=FULFILLMENT").locator("xpath=ancestor::*[self::div][1]"); }
  getStatusActionButton(label) { return this.page.getByRole("button", { name: new RegExp(label, "i") }); }
  getLogs() { return this.page.locator("text=Logs").locator("xpath=following::*").filter({ hasText: /Status changed|Order created|Return/ }); }
  getProductStockText() { return this.page.locator('text=/Stock:\\s*\\d+/'); }
}
module.exports = OrdersPage;
