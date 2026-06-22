const AdminLoginPage = require("../pages/AdminLoginPage");
const config = require("../config/env.config");

class AdminAuthActions {
  constructor(page) {
    this.page = page;
    this.login = new AdminLoginPage(page);
  }

  async loginAs(email, password) {
    await this.page.goto(config.admin.loginURL, { waitUntil: "domcontentloaded" });
    await this.login.getEmailInput().fill(email);
    await this.login.getPasswordInput().fill(password);
    const remember = this.login.getRememberCheckbox();
    if ((await remember.count()) && !(await remember.isChecked())) {
      await remember.check().catch(() => {});
    }
    await this.login.getSignInButton().click();
    await this.page.waitForURL("**/shop/**/dashboard**", { timeout: 60000 });
  }

  async loginAsOwner() {
    await this.loginAs(config.admin.owner.email, config.admin.owner.password);
  }

  async loginAsAdminUser() {
    await this.loginAs(config.admin.adminUser.email, config.admin.adminUser.password);
  }

  // Returns the captured auth API status code for negative-login assertions.
  async attemptLogin(email, password) {
    let status = null;
    const handler = (resp) => {
      if (/auth\/.*login/i.test(resp.url())) status = resp.status();
    };
    this.page.on("response", handler);
    await this.page.goto(config.admin.loginURL, { waitUntil: "domcontentloaded" });
    await this.login.getEmailInput().fill(email);
    await this.login.getPasswordInput().fill(password);
    await this.login.getSignInButton().click();
    await this.page.waitForTimeout(4000);
    this.page.off("response", handler);
    return { status, url: this.page.url() };
  }
}
module.exports = AdminAuthActions;
