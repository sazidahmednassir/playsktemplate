// AdminUsersPage — locators only (POM).
class AdminUsersPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Users", level: 1 }).first();
    this.searchBox = page.getByRole("textbox", { name: /Search by name, email or phone/i });
    this.roleFilter = page.getByRole("combobox");
    this.bannedOnly = page.getByRole("checkbox", { name: "Banned only" });
    this.filterButton = page.getByRole("button", { name: "Filter" });

    this.table = page.getByRole("table");
    this.rows = page.getByRole("row");
    this.totalCounter = page.getByText(/\d+ total/);
    this.adminRow = page.getByRole("row", { name: /Admin/ });
    this.banButtons = page.getByRole("button", { name: "Ban" });
  }

  path() {
    return "/admin/users";
  }

  rowByEmail(email) {
    return this.page.getByRole("row").filter({ hasText: email });
  }
}

module.exports = AdminUsersPage;
