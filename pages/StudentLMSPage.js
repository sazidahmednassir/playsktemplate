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
  getValidationAgreementCheckbox: (page) =>
    page.getByRole("checkbox", { name: /agree with the validation process/i }),

  getStartAttemptBtn: (page) =>
    page.locator("#id_submitbutton"),
  getCancelBtn: (page) =>
    page.locator("#id_cancel"),

  // ---------- Proctoring Pro: negative + suspicious states ----------
  // TC-2: Face mismatch — popup says "Face Validation: Face not matched."
  getFaceMismatchMessage: (page) =>
    page.getByText(
      /face\s*validation\s*:\s*face\s*(not\s*match(ed)?|mismatch(ed)?|did\s*not\s*match)/i,
    ).first(),

  // TC-3: Camera permission denied — Proctoring Pro typically renders
  // a webcam-error / "Allow camera access" notice when getUserMedia rejects.
  getCameraPermissionError: (page) =>
    page.locator(
      '#fc-camera-error, .fc-camera-error, [data-region="proctoring-camera-error"]',
    ).or(
      page.getByText(
        /(camera|webcam).*(permission|access|denied|blocked|not\s*allowed)|allow\s*camera/i,
      ),
    ).first(),

  // TC-4: No camera device available
  getNoCameraDeviceError: (page) =>
    page.getByText(
      /(no\s*camera|webcam\s*not\s*found|no\s*video\s*device|device\s*not\s*detected)/i,
    ).first(),

  // TC-5: Suspicious activity — multi-face / no-face proctoring warnings
  getNoFaceWarning: (page) =>
    page.getByText(
      /(no\s*face\s*detected|face\s*not\s*detected|please\s*show\s*your\s*face)/i,
    ).first(),
  getMultipleFacesWarning: (page) =>
    page.getByText(
      /(multiple\s*faces|more\s*than\s*one\s*face|two\s*faces|another\s*person)/i,
    ).first(),
  getSuspiciousActivityBanner: (page) =>
    page.locator(
      '.proctoring-warning, .fc-suspicious, [data-region="proctoring-warning"]',
    ).or(
      page.getByText(/suspicious\s*activity|violation\s*detected/i),
    ).first(),

  // TC-6: Full proctoring flow — webcam preview tile + first quiz question
  getWebcamPreview: (page) =>
    page.locator(
      'video, canvas, #fc-camera-preview, .proctoring-webcam, [id*="proctor" i], [class*="proctor" i], [id*="webcam" i], [class*="webcam" i]',
    ).first(),
  getQuizQuestionStem: (page) =>
    page.locator(".que, .qtext, .que .formulation, .formulation").first(),
  getFinishAttemptBtn: (page) =>
    page.getByRole("link", { name: /finish\s*attempt/i })
      .or(page.getByRole("button", { name: /finish\s*attempt/i }))
      .first(),
  getSubmitAllAndFinishBtn: (page) =>
    page.getByRole("button", { name: /submit\s*all\s*and\s*finish/i })
      .or(page.getByRole("link", { name: /submit\s*all\s*and\s*finish/i }))
      .first(),
  getQuizSubmissionConfirm: (page) =>
    page.getByRole("dialog").filter({ hasText: /submit/i }).getByRole("button", { name: /submit/i }).first(),

  // ---------- TC-7: Logout ----------
  getUserMenuBtn: (page) =>
    page.getByRole("button", { name: /sazid|student/i }).first(),
  getLogoutLink: (page) =>
    page.getByRole("link", { name: /log\s*out/i }),
};

module.exports = StudentLMSPage;
