// AuthActions — login / register / logout business logic.
// Locators come from page objects; assertions stay in the spec files.
const LoginPage = require("../pages/LoginPage");
const RegisterPage = require("../pages/RegisterPage");
const cfg = require("../config/env.config");

class AuthActions {
  constructor(page) {
    this.page = page;
    this.login = new LoginPage(page);
    this.register = new RegisterPage(page);
  }

  /** Navigate to the login page on the given host (user or admin). */
  async gotoLogin(base = cfg.baseURL) {
    await this.page.goto(`${base}/login`, { waitUntil: "domcontentloaded" });
  }

  /** Fill + submit login. Does not assert outcome. */
  async signIn(email, password, base = cfg.baseURL) {
    await this.gotoLogin(base);
    await this.login.emailInput.fill(email);
    await this.login.passwordInput.fill(password);
    await this.login.signInButton.click();
    await this.page.waitForLoadState("networkidle").catch(() => {});
  }

  async signInAsOwner() {
    await this.signIn(cfg.owner.username, cfg.owner.password, cfg.baseURL);
  }

  async signInAsAdmin() {
    await this.signIn(cfg.admin.username, cfg.admin.password, cfg.adminBaseURL);
  }

  async signInAsRenter() {
    await this.signIn(cfg.renter.username, cfg.renter.password, cfg.baseURL);
  }

  /** Fill + submit registration with the provided field overrides. */
  async registerUser({
    name = "QA Auto User",
    email,
    phone = "01712345699",
    password = "Password123!",
    confirm = "Password123!",
    role = "renter",
    acceptTerms = true,
    base = cfg.baseURL,
  }) {
    await this.page.goto(`${base}/register`, { waitUntil: "domcontentloaded" });
    if (name !== null) await this.register.fullName.fill(name);
    if (email !== null) await this.register.email.fill(email);
    if (phone !== null) await this.register.phone.fill(phone);
    if (password !== null) await this.register.password.fill(password);
    if (confirm !== null) await this.register.confirmPassword.fill(confirm);
    if (role === "owner") await this.register.roleListProperty.check();
    if (acceptTerms) await this.register.terms.check();
    await this.register.createAccountButton.click();
    await this.page.waitForLoadState("domcontentloaded").catch(() => {});
  }

  async logout() {
    const btn = this.page.getByRole("button", { name: /Log ?out/i });
    if (await btn.count()) {
      await btn.first().click();
      await this.page.waitForLoadState("domcontentloaded").catch(() => {});
    }
  }
}

module.exports = AuthActions;
