// Action class for eLearning23 LMS student flows — business logic + assertions.
// Source-of-truth: data/Proctoring Pro.xlsx → "Student" → TC-1
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
}

module.exports = StudentLMSActions;
