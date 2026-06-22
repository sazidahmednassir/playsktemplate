// Locators only — Sikder Store storefront (sk-store.myei.app).
class StoreFrontPage {
  constructor(page) {
    this.page = page;
  }
  getProductCards() { return this.page.locator('[class*="product" i]').filter({ has: this.page.getByRole("button", { name: /Add to Cart|Buy Now/i }) }); }
  getBuyNowButtons() { return this.page.getByRole("button", { name: /Buy Now/i }); }
  getAddToCartButtons() { return this.page.getByRole("button", { name: /Add to Cart/i }); }
  getCartIcon() { return this.page.locator('a[href*="cart" i], [aria-label*="cart" i]').first(); }
  getCheckoutButton() { return this.page.getByRole("button", { name: /Checkout|Place Order|Confirm Order/i }); }
  getNameInput() { return this.page.locator('input[name*="name" i], #name').first(); }
  getPhoneInput() { return this.page.locator('input[name*="phone" i], input[type="tel"]').first(); }
  getAddressInput() { return this.page.locator('textarea, input[name*="address" i]').first(); }
  getPaymentOption(method) { return this.page.locator(`text=/${method}/i`).first(); }
}
module.exports = StoreFrontPage;
