// RegisterPage — locators only (POM).
class RegisterPage {
  constructor(page) {
    this.page = page;
    this.fullName = page.getByRole("textbox", { name: "Full Name" });
    this.email = page.getByRole("textbox", { name: "Email address" });
    this.phone = page.getByRole("textbox", { name: "Phone" });
    this.password = page.getByRole("textbox", { name: "Password", exact: true });
    this.confirmPassword = page.getByRole("textbox", { name: "Confirm Password" });
    this.roleFindRental = page.getByRole("radio", { name: "Find a rental" });
    this.roleListProperty = page.getByRole("radio", { name: "List a property" });
    this.terms = page.getByRole("checkbox", { name: /I agree to the Terms/i });
    this.createAccountButton = page.getByRole("button", { name: "Create account" });
    this.signInLink = page.getByRole("link", { name: "Sign in" });
  }

  path() {
    return "/register";
  }
}

module.exports = RegisterPage;
