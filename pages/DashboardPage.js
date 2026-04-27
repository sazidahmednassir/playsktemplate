const DashboardPage = {
  getBreadcrumb: (page) => page.locator(".oxd-topbar-header-breadcrumb"),
  getDashboardHeading: (page) =>
    page.locator(".oxd-topbar-header-breadcrumb", { hasText: "Dashboard" }),
  getQuickLaunchCards: (page) =>
    page.locator(".orangehrm-quick-launch-card"),
  getQuickLaunchByTitle: (page, title) =>
    page.locator(".orangehrm-quick-launch-card", { hasText: title }),
  getTimeAtWorkWidget: (page) =>
    page.locator(".oxd-grid-item.orangehrm-dashboard-widget").filter({ hasText: "Time at Work" }).first(),
  getMyActionsWidget: (page) =>
    page.locator(".oxd-grid-item.orangehrm-dashboard-widget").filter({ hasText: "My Actions" }).first(),
};

module.exports = DashboardPage;
