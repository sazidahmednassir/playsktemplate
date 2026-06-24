// LoginPage — locators only (POM). Logic lives in actions/AuthActions.
class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.getByRole("textbox", { name: "Email address" });
    this.passwordInput = page.getByRole("textbox", { name: "Password" });
    this.rememberMe = page.getByRole("checkbox", { name: "Remember me" });
    this.signInButton = page.getByRole("button", { name: "Sign in" });
    this.forgotPasswordLink = page.getByRole("link", { name: "Forgot password?" });
    this.createAccountLink = page.getByRole("link", { name: "Create one free" });
    this.googleButton = page.getByRole("link", { name: "Continue with Google" });
    // Laravel surfaces auth errors in a validation summary / field error text.
    this.errorText = page.getByText(/do not match our records|required|must be a valid/i);
  }

  path() {
    return "/login";
  }
}

module.exports = LoginPage;
