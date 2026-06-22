// Locators only — Return detail (/shop/<slug>/returns/<id>): settle / reject.
class ReturnDetailPage {
  constructor(page) {
    this.page = page;
  }
  getRtnHeading() { return this.page.locator("h1"); }
  getStatusBadge() { return this.page.locator("text=/^(Requested|Settled|Rejected|Processing)$/").first(); }
  getTypeLabel() { return this.page.locator("text=/^(Return|Exchange|Damage Claim)$/").first(); }
  getReturnedItems() { return this.page.locator("text=Returned Items").locator("xpath=ancestor::*[1]"); }
  getSettlementPanel() { return this.page.locator("text=Settlement").locator("xpath=ancestor::*[1]"); }
  getItemsRefundValue() { return this.page.locator("text=Items refund").locator("xpath=following::*[1]"); }
  getCashRefundValue() { return this.page.locator("text=/Cash refund/").locator("xpath=following::*[1]"); }
  getStockUpdatedValue() { return this.page.locator("text=Stock Updated").locator("xpath=following::*[1]"); }
  getNoteInput() { return this.page.locator('textarea, input[placeholder*="note" i]').first(); }
  getSettleButton() { return this.page.getByRole("button", { name: /Settle Return/i }); }
  getRejectButton() { return this.page.getByRole("button", { name: /Reject/i }); }
  getTimeline() { return this.page.locator("text=Timeline").locator("xpath=ancestor::*[1]"); }
}
module.exports = ReturnDetailPage;
