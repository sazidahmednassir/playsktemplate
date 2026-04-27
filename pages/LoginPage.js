const LoginPage = {
  getUsernameInput: (page) => page.getByPlaceholder("Username"),
  getPasswordInput: (page) => page.getByPlaceholder("Password"),
  getLoginBtn: (page) => page.getByRole("button", { name: "Login" }),
  getErrorMessage: (page) =>
    page.locator(".oxd-alert-content--error", { hasText: "Invalid credentials" }),
  getRequiredError: (page) => page.locator(".oxd-input-field-error-message"),
  getForgotPasswordLink: (page) =>
    page.locator(".orangehrm-login-forgot-header"),
};

module.exports = LoginPage;
