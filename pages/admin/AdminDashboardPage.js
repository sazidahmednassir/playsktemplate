// AdminDashboardPage — locators only (POM).
class AdminDashboardPage {
  constructor(page) {
    this.page = page;
    this.adminPanelLabel = page.getByText("Admin Panel");
    this.heading = page.getByRole("heading", { name: "Dashboard", level: 1 });

    // Sidebar nav
    this.navDashboard = page.getByRole("link", { name: "Dashboard" });
    this.navReviewQueue = page.getByRole("link", { name: "Review Queue" });
    this.navAddListing = page.getByRole("link", { name: "Add Listing" });
    this.navUsers = page.getByRole("link", { name: "Users" });
    this.navMessages = page.getByRole("link", { name: "Messages" });
    this.navNidVerify = page.getByRole("link", { name: "NID Verify" });
    this.logoutButton = page.getByRole("button", { name: "Log out" });

    // KPI cards
    this.pendingReview = page.getByText("Pending Review", { exact: true });
    this.approvedListings = page.getByText("Approved Listings", { exact: true });
    this.totalUsers = page.getByText("Total Users", { exact: true });
    this.totalListings = page.getByText("Total Listings", { exact: true });
  }

  path() {
    return "/admin/dashboard";
  }
}

module.exports = AdminDashboardPage;
