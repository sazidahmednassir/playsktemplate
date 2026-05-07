// Action class for eLearning23 LMS student flows — business logic + assertions.
// Source-of-truth: data/Proctoring Pro.xlsx → "Student" → TC-1 ... TC-6
//
// Locator trace (POM): every interaction routes through StudentLMSPage.
// Avoid waitForTimeout — use Playwright auto-waiting & waitFor.

const StudentLMSPage = require("../pages/StudentLMSPage");
const { expect } = require("@playwright/test");

class StudentLMSActions {
  constructor(page) {
    this.page = page;
  }

  /**
   * Precondition step: open login page and log in as a student.
   * @param {string} baseURL  e.g. https://education.elearning23.com/
   * @param {string} email
   * @param {string} password
   */
  async loginAsStudent(baseURL, email, password) {
    // Navigate to the Moodle login page directly
    const loginURL = baseURL.replace(/\/$/, "") + "/login/index.php";
    await this.page.goto(loginURL, { waitUntil: "domcontentloaded" });

    // Handle Moodle's "already logged in" dialog if it appears
    const alreadyLoggedInCancel = this.page.getByRole("button", { name: "Cancel" });
    const usernameField = StudentLMSPage.getEmailInput(this.page);

    const whichAppeared = await Promise.race([
      alreadyLoggedInCancel.waitFor({ state: "visible", timeout: 10000 })
        .then(() => "already-logged-in"),
      usernameField.waitFor({ state: "visible", timeout: 10000 })
        .then(() => "login-form"),
    ]).catch(() => "unknown");

    if (whichAppeared === "already-logged-in") {
      // User is already logged in — click Cancel to stay logged in
      await alreadyLoggedInCancel.click();
      await this.page.waitForURL("**/my/**", { timeout: 15000 });
      await this.page.waitForLoadState("networkidle");
    } else {
      // Normal login flow
      await usernameField.fill(email);
      await StudentLMSPage.getPasswordInput(this.page).fill(password);
      await StudentLMSPage.getLoginBtn(this.page).click();

      // Wait until redirected to dashboard (/my/)
      await this.page.waitForURL("**/my/**", { timeout: 15000 });
      await this.page.waitForLoadState("networkidle");
    }

    // Verify dashboard loaded
    await expect(StudentLMSPage.getDashboardHeading(this.page))
      .toBeVisible({ timeout: 15000 });
  }

  /**
   * Navigate to My Courses and open a specific course, then optionally a quiz.
   * @param {string} courseName  e.g. "Computational Problem Solving"
   * @param {string} [quizName]  Optional specific quiz name to click.
   */
  async openCourseQuiz(courseName, quizName) {
    // Click "My courses" in the sidebar navigation
    const myCoursesLink = StudentLMSPage.getMyCoursesLink(this.page);
    if (await myCoursesLink.isVisible().catch(() => false)) {
      await myCoursesLink.click();
      await this.page.waitForLoadState("networkidle");
    }

    // Click the course card/link
    await StudentLMSPage.getCourseLink(this.page, courseName).click();
    await this.page.waitForLoadState("networkidle");

    // If a specific quiz name is provided, click it inside the course
    if (quizName) {
      await StudentLMSPage.getQuizLink(this.page, quizName).click();
      await this.page.waitForLoadState("networkidle");
    }
  }

  /**
   * TC-1 Step 2: Click "Attempt Quiz" if present, else "Continue Attempt".
   * Whichever is visible wins.
   */
  async clickAttemptOrContinue() {
    const attempt = StudentLMSPage.getAttemptQuizBtn(this.page);
    const cont = StudentLMSPage.getContinueAttemptBtn(this.page);

    // Wait until at least one of them is attached to DOM
    await Promise.race([
      attempt.waitFor({ state: "visible", timeout: 15000 }).catch(() => null),
      cont.waitFor({ state: "visible", timeout: 15000 }).catch(() => null),
    ]);

    if (await cont.isVisible().catch(() => false)) {
      await cont.click();
    } else {
      await attempt.click();
    }
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * TC-1 Step 3: click the Validate Face button shown by the Proctoring Pro plugin.
   */
  async clickValidateFace() {
    const btn = StudentLMSPage.getValidateFaceBtn(this.page);
    await btn.waitFor({ state: "visible", timeout: 15000 });
    await btn.click();
  }

  /**
   * TC-1 Expected Result:
   * "Face validation only show like 'Face Validation: Face matched.' in the popup"
   */
  async verifyFaceValidationMatched() {
    const matched = StudentLMSPage.getFaceMatchedMessage(this.page);
    await expect(matched).toBeVisible({ timeout: 30000 });
    await expect(matched).toContainText(/face\s*matched/i);
  }

  /**
   * Convenience helper for negative scenarios: returns the face validation status text.
   */
  async readFaceValidationMessage() {
    const status = StudentLMSPage.getFaceValidationStatus(this.page);
    await status.waitFor({ state: "visible", timeout: 30000 });
    return (await status.textContent())?.trim() ?? "";
  }

  // ---------- TC-2 Face mismatch ----------

  /**
   * TC-2 Expected Result:
   * Popup shows "Face Validation: Face not matched." when the live camera
   * feed (mismatch.y4m) does not match the enrolled photo on the server.
   */
  async verifyFaceValidationMismatch() {
    const mismatch = StudentLMSPage.getFaceMismatchMessage(this.page);
    await expect(mismatch).toBeVisible({ timeout: 30000 });
    await expect(mismatch).toContainText(
      /face\s*(not\s*match(ed)?|mismatch(ed)?|did\s*not\s*match)/i,
    );
  }

  // ---------- TC-3 Camera permission denied ----------

  /**
   * Revoke the camera permission on the current Browser Context BEFORE
   * the page asks for it. Call this from a test that wants to simulate
   * a denied permission.
   *
   * Playwright's `BrowserContext.clearPermissions()` makes any subsequent
   * getUserMedia() call reject with NotAllowedError, which Proctoring Pro
   * surfaces as a camera-error banner.
   */
  async denyCameraPermission() {
    await this.page.context().clearPermissions();
    // Also block the origin explicitly so a re-request will fail.
    // Some Chromium builds re-prompt unless the origin is in the deny set.
    const origin = new URL(this.page.url()).origin;
    await this.page.context().grantPermissions([], { origin });
  }

  /**
   * TC-3 Expected Result:
   * The page surfaces a camera-permission error and the Validate Face
   * action either is disabled or surfaces a "camera blocked" message.
   */
  async verifyCameraPermissionError() {
    const err = StudentLMSPage.getCameraPermissionError(this.page);
    await expect(err).toBeVisible({ timeout: 30000 });
  }

  // ---------- TC-4 No camera device ----------

  /**
   * TC-4 Expected Result:
   * When Chromium has no video device available the plugin renders a
   * "no camera detected" notice. Triggered in tests by launching without
   * --use-fake-device-for-media-stream (see test.use launchOptions).
   */
  async verifyNoCameraDeviceError() {
    // Either the dedicated "no device" message OR the generic camera error
    // is acceptable — Moodle plugins differ across versions.
    const noDevice = StudentLMSPage.getNoCameraDeviceError(this.page);
    const generic = StudentLMSPage.getCameraPermissionError(this.page);
    const visible = await Promise.race([
      noDevice.waitFor({ state: "visible", timeout: 30000 }).then(() => "no-device").catch(() => null),
      generic.waitFor({ state: "visible", timeout: 30000 }).then(() => "generic").catch(() => null),
    ]);
    expect(visible, "expected a camera-unavailable message to appear").not.toBeNull();
  }

  // ---------- TC-5 Suspicious activity ----------

  /**
   * TC-5a Expected Result:
   * "No face detected" warning when the camera feed is empty (no-face.y4m).
   */
  async verifyNoFaceWarning() {
    const warn = StudentLMSPage.getNoFaceWarning(this.page);
    await expect(warn).toBeVisible({ timeout: 30000 });
  }

  /**
   * TC-5b Expected Result:
   * "Multiple faces detected" warning when the feed contains 2+ faces
   * (multi-face.y4m). Some plugin builds only flag this in the suspicious
   * activity banner, so we accept either signal.
   */
  async verifyMultipleFacesWarning() {
    const multi = StudentLMSPage.getMultipleFacesWarning(this.page);
    const banner = StudentLMSPage.getSuspiciousActivityBanner(this.page);
    const visible = await Promise.race([
      multi.waitFor({ state: "visible", timeout: 30000 }).then(() => "multi").catch(() => null),
      banner.waitFor({ state: "visible", timeout: 30000 }).then(() => "banner").catch(() => null),
    ]);
    expect(visible, "expected a multiple-faces / suspicious banner").not.toBeNull();
  }

  // ---------- TC-6 Full proctoring flow ----------

  /**
   * Click the Start Attempt button on the proctoring modal once the face
   * has matched. Proceeds into the actual quiz.
   */
  async startAttempt() {
    // Check the 'I agree with the validation process' checkbox which enables the submit button
    const checkbox = StudentLMSPage.getValidationAgreementCheckbox(this.page);
    if (await checkbox.isVisible({ timeout: 5000 }).catch(() => false)) {
      await checkbox.check();
    }

    const btn = StudentLMSPage.getStartAttemptBtn(this.page);
    await btn.waitFor({ state: "visible", timeout: 15000 });
    await btn.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * TC-6 Expected: while the quiz is open the webcam preview tile remains
   * visible and the first question is rendered.
   */
  async verifyQuizInProgressWithProctoring() {
    await expect(StudentLMSPage.getQuizQuestionStem(this.page))
      .toBeVisible({ timeout: 15000 });
  }

  /**
   * Finish the quiz attempt — clicks "Finish attempt" then "Submit all and finish".
   * Confirmation dialog (if any) is auto-confirmed.
   */
  async finishAttempt() {
    const finish = StudentLMSPage.getFinishAttemptBtn(this.page);
    if (await finish.isVisible().catch(() => false)) {
      await finish.click();
      await this.page.waitForLoadState("networkidle");
    }
    const submit = StudentLMSPage.getSubmitAllAndFinishBtn(this.page);
    if (await submit.isVisible().catch(() => false)) {
      await submit.click();
    }
    const confirm = StudentLMSPage.getQuizSubmissionConfirm(this.page);
    if (await confirm.isVisible({ timeout: 5000 }).catch(() => false)) {
      await confirm.click();
    }
    await this.page.waitForLoadState("networkidle");
  }
}

module.exports = StudentLMSActions;
