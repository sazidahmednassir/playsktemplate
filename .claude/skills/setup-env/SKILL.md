---
name: setup-env
description: Set up the project environment — install dependencies, configure .env, install browsers, and verify the setup is ready to run tests.
user-invocable: true
allowed-tools: Bash Read Edit Write
---

# Setup Environment — Configure and Verify Project Setup

Run this skill when setting up the project for the first time or on a new machine.

---

## Step 0: First-Time Project Onboarding

If `.env` does not exist yet, ask the user these questions before touching anything else.
Collect all answers first, then write them into `.env` in one pass.

### Question 1 — Project Type

Ask:
> "What type of project is this?"

Options (accept free text too):
- **LMS** — e.g. Moodle, Canvas, Blackboard
- **eCommerce** — e.g. Shopify, WooCommerce, Magento
- **CRM / ERP** — e.g. Salesforce, HubSpot, SAP
- **HR / Payroll** — e.g. OrangeHRM, Workday
- **Custom web app**

Record the project type. It determines which challenge flags to surface in Step 0c.

### Question 2 — Target Site URL(s)

Ask:
> "What is the login URL of the site under test?"

Example answer: `https://your-lms-site.com/login/index.php`

Write this as `BASE_URL` in `.env`. If the project also has a module-specific base URL (e.g. LMS student portal is a sub-path), ask for that too and write it as the appropriate variable (e.g. `LMS_BASE_URL`).

### Question 3 — Credentials

Ask for:
- Primary test user email/username → `USER2_EMAIL`
- Primary test user password → `USER2_PASSWORD`
- Any secondary role accounts (e.g. student, teacher, admin) → module-specific vars

For an LMS project also ask:
- Student email → `LMS_STUDENT_EMAIL`
- Student password → `LMS_STUDENT_PASSWORD`
- Course name under test → `LMS_COURSE_NAME`
- Quiz name under test → `LMS_QUIZ_NAME`

### Question 4 — Project-Specific Challenges

Ask:
> "Are there any known automation challenges on this site? (e.g. captcha, 2FA, file uploads, biometric checks)"

Use the project type from Question 1 to proactively flag known challenges:

| Project Type | Known Challenge | Required Setup |
|---|---|---|
| **LMS + Proctoring** | Face validation requires a registered base image | Replace `data/fixtures/face/baseline.jpg` with the real student photo uploaded to the LMS profile, then run `bash data/fixtures/face/generate-y4m.sh` to regenerate Y4M fixtures |
| **LMS + Proctoring** | Camera feed is faked via Y4M files | Y4M files are git-ignored — every contributor must run `generate-y4m.sh` locally |
| **eCommerce** | Payment gateways often block test cards | Use sandbox/test mode credentials |
| **Any** | CAPTCHA | Disable in test environment or use bypass token |
| **Any** | 2FA / OTP | Use a test account with 2FA disabled |

After the user confirms or adds their own challenges, document them in `.env` as comments so the next contributor sees them immediately.

---

## Step 1: Check Node.js

```bash
node --version
```

Require Node.js 18+. If not installed, tell the user to install it.

---

## Step 2: Install Dependencies

```bash
npm install
```

---

## Step 3: Install Playwright Browsers

```bash
npx playwright install --with-deps
```

---

## Step 4: Configure `.env`

If `.env` already exists, skip to Step 5.

If not, copy from `.env.example`:

```bash
cp .env.example .env
```

Fill in values collected in Step 0:

| Variable | Description | Example |
|---|---|---|
| `BASE_URL` | Full login URL of the target app | `https://your-lms-site.com/login/index.php` |
| `USER2_EMAIL` | Primary test user email | `user@example.com` |
| `USER2_PASSWORD` | Primary test user password | `Admin@123` |
| `AUTH_STATE_PATH` | Path to save browser session | `.auth/state.json` |
| `LMS_BASE_URL` | LMS root URL (LMS projects only) | `https://your-lms-site.com/` |
| `LMS_STUDENT_EMAIL` | Student account email | `student@example.com` |
| `LMS_STUDENT_PASSWORD` | Student account password | `Student@123` |
| `LMS_COURSE_NAME` | Course name under test | `Computational Problem Solving` |
| `LMS_QUIZ_NAME` | Quiz name under test | `Test Quiz` |
| `USE_REAL_CAMERA` | Use real webcam instead of Y4M | `false` |

Add challenge notes as comments at the bottom of `.env`. Example:

```env
# CHALLENGE: Proctoring Pro requires a base image.
# Replace data/fixtures/face/baseline.jpg with the real student LMS profile photo
# then run: bash data/fixtures/face/generate-y4m.sh
```

---

## Step 5: Create Auth Directory

```bash
mkdir -p .auth
```

---

## Step 6: LMS + Proctoring Pro — Base Image Setup

**Only required if project type is LMS with Proctoring Pro.**

The face validation tests (TC-1, TC-6) compare the live camera feed against a stored profile photo. Until you replace the placeholder, TC-1 and TC-6 will fail with "Face not matched."

1. Download the student photo that is uploaded to the LMS profile.
2. Replace `data/fixtures/face/baseline.jpg` with that photo (640×480 JPEG recommended).
3. Regenerate all Y4M camera fixtures:
   ```bash
   bash data/fixtures/face/generate-y4m.sh
   ```
4. Confirm the Y4M files were created:
   ```bash
   ls data/fixtures/face/*.y4m
   ```

Skip this step if `USE_REAL_CAMERA=true` (uses the real webcam instead).

---

## Step 7: Verify Setup

Run a smoke test to confirm everything works:

```bash
npx playwright test --grep "@baseline" --project=student-baseline
```

If it passes, setup is complete.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Cannot find module` | Run `npm install` |
| Browser not found | Run `npx playwright install --with-deps` |
| TC-1/TC-6 fail with "Face not matched" | Base image not set — follow Step 6 |
| Y4M files missing | Run `bash data/fixtures/face/generate-y4m.sh` |
| Login test fails with timeout | Check `.env` `BASE_URL` and credentials |
| `.auth/state.json` error | Run `mkdir -p .auth` and re-run tests |
| Permission denied on `.auth/` | Run `chmod 755 .auth` |

---

## Output

After successful setup, report:
- Node.js version
- Dependencies installed
- Playwright browsers installed
- `.env` status (created or already existed)
- Project type recorded
- Challenges documented
- Base image status (LMS only): ready or pending
- Smoke test result (pass/fail)
