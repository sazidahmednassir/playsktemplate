// Locators only — Returns & Refunds dashboard (/shop/<slug>/returns).
class ReturnsListPage {
  constructor(page) {
    this.page = page;
  }
  getHeading() { return this.page.getByRole("heading", { name: /Returns & Refunds/i }); }
  getTotalRefundedKpi() { return this.page.locator("text=/Total Refunded/i").locator("xpath=ancestor::*[1]"); }
  getSearchInput() { return this.page.locator('input[placeholder*="RTN" i]'); }
  getStatusFilter() { return this.page.locator("select").first(); }
  getRows() { return this.page.locator("table tbody tr"); }
  getRowByRtn(rtn) { return this.page.locator("table tbody tr", { hasText: rtn }); }
  getRefundCellFor(rtn) { return this.getRowByRtn(rtn).locator("td").nth(5); }
  getViewButtonFor(rtn) { return this.getRowByRtn(rtn).getByRole("button", { name: /View/i }); }
}
module.exports = ReturnsListPage;
