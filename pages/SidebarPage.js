const SidebarPage = {
  getSidebar: (page) => page.locator(".oxd-sidepanel"),
  getMenuItemByName: (page, name) =>
    page.locator(".oxd-main-menu-item", { hasText: name }),
  getSearchInput: (page) =>
    page.locator(".oxd-main-menu-search input"),
};

module.exports = SidebarPage;
