// OwnerDashboardPage — locators only (POM).
class OwnerDashboardPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: /Good (morning|afternoon|evening)/i });
    this.ownerBadge = page.getByText("Owner", { exact: true });

    // Sidebar nav
    this.navDashboard = page.getByRole("link", { name: "Dashboard" });
    this.navMyListings = page.getByRole("link", { name: "My Listings" });
    this.navAddListing = page.getByRole("link", { name: "Add Listing" }).first();
    this.navMessages = page.getByRole("link", { name: "Messages" });
    this.navProfile = page.getByRole("link", { name: "Profile" });
    this.logoutButton = page.getByRole("button", { name: "Log out" });

    // KPI cards
    this.approvedCard = page.getByText("Approved", { exact: true });
    this.pendingCard = page.getByText("Pending Review");
    this.totalViewsCard = page.getByText("Total Views");
    this.unreadCard = page.getByText("Unread Messages");
    this.recentListings = page.getByRole("heading", { name: "Recent Listings" });
  }

  path() {
    return "/owner/dashboard";
  }
}

module.exports = OwnerDashboardPage;
