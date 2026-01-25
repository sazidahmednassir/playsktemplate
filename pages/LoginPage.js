const LoginPage = {
  getUsername: (page) => page.getByRole("textbox", { name: "Email address" }),
  getPassword: (page) => page.getByRole("textbox", { name: "Password" }),
  getContinueBtn: (page) => page.getByRole("button", { name: "Continue" }),
  getHomePageIdentifier: (page) =>
    page.getByRole("heading", { name: "(Beta Version)" }),
};

module.exports = LoginPage;
