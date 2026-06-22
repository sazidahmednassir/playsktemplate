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
> "What are the storefront and admin URLs of the site under test?"

Example: storefront `https://sk-store.myei.app`, admin `https://admin.myei.app/shop/sk-store`.

Write these as `STORE_URL`, `ADMIN_URL`, and `SHOP_SLUG` in `.env`.

### Question 3 — Credentials

Ask for:
- Store Owner (staff) email/password → `OWNER_EMAIL` / `OWNER_PASSWORD`
- Admin User (staff) email/password → `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- Storefront customer (if needed) → `CUSTOMER_EMAIL` / `CUSTOMER_PASSWORD`
- Sandbox payment data (bKash) → `BKASH_NUMBER` / `BKASH_OTP` / `BKASH_PIN`

### Question 4 — Project-Specific Challenges

Ask:
> "Are there any known automation challenges on this site? (e.g. captcha, 2FA, file uploads, biometric checks)"

Use the project type from Question 1 to proactively flag known challenges:

| Project Type | Known Challenge | Required Setup |
|---|---|---|
| **eCommerce (this project)** | Payment gateways block real cards | Use bKash / SSLCommerz **sandbox** mode + the test wallet in `.env` |
| **eCommerce (this project)** | Staff login may submit as a native GET before React hydrates | The setup waits for hydration and keys on `/auth/staff/login` |
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
| `STORE_URL` | Storefront base URL | `https://sk-store.myei.app` |
| `ADMIN_URL` | Admin dashboard host | `https://admin.myei.app` |
| `SHOP_SLUG` | Store slug under `/shop/` | `sk-store` |
| `OWNER_EMAIL` / `OWNER_PASSWORD` | Store Owner (staff) login | `rayhansikder63@gmail.com` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin User (staff) login | `nassir23@yopmail.com` |
| `BKASH_NUMBER` / `BKASH_OTP` / `BKASH_PIN` | bKash sandbox wallet | `01770618575` / `12121` / `123456` |
| `AUTH_DIR` | Folder for saved sessions | `.auth` |

---

## Step 5: Create Auth Directory

```bash
mkdir -p .auth
```

The `setup` Playwright project (`tests/auth.setup.js`) logs in as Store Owner /
Admin User and writes `.auth/owner.json` + `.auth/admin.json` (storageState).

---

## Step 6: Verify Setup

Run a smoke test to confirm everything works:

```bash
npx playwright test --grep "@smoke" --project=chromium
```

If the storefront/admin login and All Orders checks pass, setup is complete.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Cannot find module` | Run `npm install` |
| Browser not found | Run `npx playwright install --with-deps` |
| Login `401 Invalid credentials` on `platform-admin.myei.app` | Use the EcomIntelligence dashboard `admin.myei.app/shop/sk-store` (staff login) — see the ticket file |
| Login submits as a GET `?email=...` | React hadn't hydrated — the setup retries; ensure a short wait before submit |
| Login test fails with timeout | Check `.env` `ADMIN_URL`, `SHOP_SLUG`, and credentials |
| `.auth/owner.json` not found | Run the `setup` project first (it's a dependency of `chromium`) |

---

## Output

After successful setup, report:
- Node.js version
- Dependencies installed
- Playwright browsers installed
- `.env` status (created or already existed)
- Auth sessions saved (`.auth/owner.json`, `.auth/admin.json`)
- Smoke test result (pass/fail)
