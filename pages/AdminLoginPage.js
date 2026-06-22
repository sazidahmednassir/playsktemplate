// Locators only — EcomIntelligence staff login (admin.myei.app/shop/<slug>).
class AdminLoginPage {
  constructor(page) {
    this.page = page;
  }
  getEmailInput() { return this.page.locator("#email"); }
  getPasswordInput() { return this.page.locator("#password"); }
  getRememberCheckbox() { return this.page.locator("#terms"); }
  getSignInButton() { return this.page.locator('button[type=submit]'); }
}
module.exports = AdminLoginPage;
