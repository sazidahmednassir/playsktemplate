// Page Object for the eLearning23 LMS — locators ONLY (no logic, no assertions).
// Generated from data/Proctoring Pro.xlsx → tab "Student" → TC-1.
// Selectors verified against actual Moodle site: education.elearning23.com

const StudentLMSPage = {
  // ---------- Login ----------
  getEmailInput: (page) =>
    page.locator("#username"),
  getPasswordInput: (page) =>
    page.locator("#password"),
  getLoginBtn: (page) =>
    page.locator("#loginbtn"),
  getLoginError: (page) =>
    page.locator('.alert, .error, [role="alert"]').first(),

  // ---------- Top-level navigation ----------
  getDashboardHeading: (page) =>
    page.getByRole("heading", { name: /dashboard/i }).first(),
  getMyCoursesLink: (page) =>
    page.locator('a[href*="my/courses.php"]').first(),
  getCourseLink: (page, courseName) =>
    page.locator(`a.aalink.coursename`).filter({ hasText: courseName }).first(),

  // ---------- Inside a course ----------
  getQuizLink: (page, quizName) =>
    page.getByRole("link", { name: new RegExp(quizName, "i") }).first(),

  // ---------- Quiz attempt screen ----------
  // Step 2: "Click the attempt quiz button or Continue Attempt button"
  getAttemptQuizBtn: (page) =>
    page.getByRole("button", { name: /attempt quiz/i })
      .or(page.getByRole("link", { name: /attempt quiz/i })),
  getContinueAttemptBtn: (page) =>
    page.getByRole("button", { name: /continue.*(last )?attempt/i })
      .or(page.getByRole("link", { name: /continue.*(last )?attempt/i })),

  // Step 3: "Click Validate face Button" — Proctoring Pro plugin
  getValidateFaceBtn: (page) =>
    page.locator("#fcvalidate"),

  // ---------- Proctoring Pro plugin output ----------
  // Expected: popup containing 'Face Validation: Face matched.'
  getFaceValidationPopup: (page) =>
    page.locator('[role="dialog"], .modal, .swal2-popup, .popup, .moodle-dialogue').filter({
      hasText: /face\s*validation/i,
    }).first(),

  getFaceMatchedMessage: (page) =>
    page.getByText(/face\s*validation\s*:\s*face\s*matched\.?/i).first(),

  getFaceValidationStatus: (page) =>
    page.getByText(/face\s*validation\s*:/i).first(),

  getPopupCloseBtn: (page) =>
    page.getByRole("button", { name: /close|ok|dismiss/i }).first(),

  // Start attempt button in the modal (after face validation)
  getStartAttemptBtn: (page) =>
    page.locator("#id_submitbutton"),
  getCancelBtn: (page) =>
    page.locator("#id_cancel"),
};

module.exports = StudentLMSPage;
