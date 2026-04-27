const ProfilePage = {
  getUserDropdown: (page) => page.locator(".oxd-userdropdown"),
  getUserDropdownName: (page) => page.locator(".oxd-userdropdown-name"),
  getLogoutLink: (page) =>
    page.getByRole("menuitem", { name: "Logout" }),
  getAboutLink: (page) =>
    page.getByRole("menuitem", { name: "About" }),
  getChangePasswordLink: (page) =>
    page.getByRole("menuitem", { name: "Change Password" }),
  getSupportLink: (page) =>
    page.getByRole("menuitem", { name: "Support" }),
};

module.exports = ProfilePage;
