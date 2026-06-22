// Locators only — Inventory / Stock Overview (/shop/<slug>/inventory).
class InventoryPage {
  constructor(page) {
    this.page = page;
  }
  getRows() { return this.page.locator("table tbody tr"); }
  getRowFor(product, warehouse) {
    let row = this.page.locator("table tbody tr", { hasText: product });
    if (warehouse) row = row.filter({ hasText: warehouse });
    return row.first();
  }
}
module.exports = InventoryPage;
