// Page Object for the eLearning23 LMS admin flow — locators ONLY (no logic).
// Generated from data/Proctoring Pro.xlsx → tab "Admin" → TC-1 (Log in).
// Selectors verified against the live Moodle site at education.elearning23.com.

const AdminPage = {
  // ---------- Login form (Moodle /login/index.php) ----------
  getUsernameInput: (page) => page.locator("#username"),
  getPasswordInput: (page) => page.locator("#password"),
  getLoginBtn: (page) => page.locator("#loginbtn"),
  getLoginError: (page) =>
    page.locator('.alert-danger, .loginerrors, [role="alert"]').first(),

  // ---------- Dashboard (/my/) ----------
  // Verified via Playwright MCP snapshot — <h1>Dashboard</h1> on /my/.
  getDashboardHeading: (page) =>
    page.getByRole("heading", { level: 1, name: /^dashboard$/i }).first(),

  // ---------- TC-2 Logout (header user-menu → modal → Log out) ----------
  // The header avatar button opens a modal that contains the Log out link.
  // Theme-level class — stable across users (unlike per-user aria-label).
  getUserMenuBtn: (page) =>
    page.locator("button.header-tools-link.tool-login"),
  getLogoutLink: (page) =>
    page.locator('.modal-content a[href*="login/logout.php"]'),
};

module.exports = AdminPage;
