// Locators only — Create Return / Exchange / Damage Claim form
// (/shop/<slug>/returns/create?orderId=...&sysId=...).
class ReturnCreatePage {
  constructor(page) {
    this.page = page;
  }
  getTypeCard(type) {
    // type ∈ "Return" | "Exchange" | "Damage Claim"
    return this.page.getByRole("button", { name: new RegExp(`^${type}\\b`, "i") })
      .or(this.page.locator(`button:has-text("${type}")`));
  }
  getReasonSelect() { return this.page.locator("select").first(); }
  getReasonDetailsInput() { return this.page.locator('input[placeholder*="Details" i]'); }
  getFullReturnToggle() { return this.page.locator("text=Full return").locator("xpath=following::input[1]"); }
  getItemCheckboxes() { return this.page.locator('input[type=checkbox]'); }
  getItemRowByName(name) { return this.page.locator("div", { hasText: name }).filter({ has: this.page.locator('input[type=checkbox]') }).first(); }
  getQtyInput() { return this.page.locator('label:has-text("Qty")').locator("xpath=following::input[1]"); }
  getConditionSelect() { return this.page.locator('label:has-text("Condition")').locator("xpath=following::select[1]"); }
  getNoteTextarea() { return this.page.locator("textarea"); }
  getSubmitButton() { return this.page.getByRole("button", { name: /Create Return Request/i }); }
  getOrderSummary() { return this.page.locator('text=/Order #\\d+/'); }
}
module.exports = ReturnCreatePage;
