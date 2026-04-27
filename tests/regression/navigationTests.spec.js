const { test } = require("../fixture/customfixture");
const config = require("../../config/env.config");

test.describe("Sidebar Navigation Tests", () => {
  /**
   * beforeEach: Ensure user is authenticated before every navigation test
   * Uses ensureLoggedIn() → navigates to app, auto re-logins if session expired
   */
  test.beforeEach(async ({ actions }) => {
    await actions.login.ensureLoggedIn(
      config.baseURL,
      config.user2.username,
      config.user2.password,
    );
  });

  /**
   * TC-NAV-001: Sidebar navigation panel is visible after login
   * Precondition: User is logged in (beforeEach)
   * Steps:
   *   1. Check for the sidebar panel element on the left side
   * Validation: Element ".oxd-sidepanel" is visible
   * Expected: Sidebar with all module menu items is displayed
   */
  test("Sidebar is visible after login", async ({ actions }) => {
    await actions.navigation.verifySidebarVisible();
  });

  /**
   * TC-NAV-002: Navigate to Admin module via sidebar
   * Precondition: User is logged in (beforeEach)
   * Steps:
   *   1. Click "Admin" menu item in sidebar (".oxd-main-menu-item" with text "Admin")
   *   2. Wait for page to load
   *   3. Check breadcrumb heading text
   * Validation: Breadcrumb ".oxd-topbar-header-breadcrumb" shows "Admin"
   * Expected: Admin module page is loaded with correct heading
   */
  test("User can navigate to Admin module", async ({ actions }) => {
    await actions.navigation.navigateToModule("Admin");
    await actions.navigation.verifyOnModule("Admin");
  });

  /**
   * TC-NAV-003: Navigate to PIM module via sidebar
   * Precondition: User is logged in (beforeEach)
   * Steps:
   *   1. Click "PIM" menu item in sidebar (".oxd-main-menu-item" with text "PIM")
   *   2. Wait for page to load
   *   3. Check breadcrumb heading text
   * Validation: Breadcrumb ".oxd-topbar-header-breadcrumb" shows "PIM"
   * Expected: PIM (Personal Information Management) module page is loaded
   */
  test("User can navigate to PIM module", async ({ actions }) => {
    await actions.navigation.navigateToModule("PIM");
    await actions.navigation.verifyOnModule("PIM");
  });

  /**
   * TC-NAV-004: Navigate to Leave module via sidebar
   * Precondition: User is logged in (beforeEach)
   * Steps:
   *   1. Click "Leave" menu item in sidebar (".oxd-main-menu-item" with text "Leave")
   *   2. Wait for page to load
   *   3. Check breadcrumb heading text
   * Validation: Breadcrumb ".oxd-topbar-header-breadcrumb" shows "Leave"
   * Expected: Leave module page is loaded with correct heading
   */
  test("User can navigate to Leave module", async ({ actions }) => {
    await actions.navigation.navigateToModule("Leave");
    await actions.navigation.verifyOnModule("Leave");
  });

  /**
   * TC-NAV-005: Navigate to Directory module via sidebar
   * Precondition: User is logged in (beforeEach)
   * Steps:
   *   1. Click "Directory" menu item in sidebar (".oxd-main-menu-item" with text "Directory")
   *   2. Wait for page to load
   *   3. Check breadcrumb heading text
   * Validation: Breadcrumb ".oxd-topbar-header-breadcrumb" shows "Directory"
   * Expected: Directory module page is loaded with correct heading
   */
  test("User can navigate to Directory module", async ({ actions }) => {
    await actions.navigation.navigateToModule("Directory");
    await actions.navigation.verifyOnModule("Directory");
  });
});
