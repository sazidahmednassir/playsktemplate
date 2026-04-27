---
name: setup-env
description: Set up the project environment — install dependencies, configure .env, install browsers, and verify the setup is ready to run tests.
user-invocable: true
allowed-tools: Bash Read Edit Write
---

# Setup Environment — Configure and Verify Project Setup

Run this skill when setting up the project for the first time or on a new machine.

## Steps

### 1. Check Node.js

```bash
node --version
```

Require Node.js 18+. If not installed, tell the user to install it.

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Playwright Browsers

```bash
npx playwright install --with-deps
```

### 4. Create `.env` from Template

Check if `.env` exists. If not, copy from `.env.example`:

```bash
cp .env.example .env
```

Then prompt the user to fill in their actual values:

| Variable | Description | Example |
|----------|-------------|---------|
| `BASE_URL` | Full login URL of the target app | `https://opensource-demo.orangehrmlive.com/web/index.php/auth/login` |
| `USER2_EMAIL` | Login username | `Admin` |
| `USER2_PASSWORD` | Login password | `admin123` |
| `AUTH_STATE_PATH` | Path to save browser session | `.auth/state.json` (default, usually no change needed) |

### 5. Create Auth Directory

```bash
mkdir -p .auth
```

### 6. Verify Setup

Run a quick test to confirm everything works:

```bash
npx playwright test tests/regression/loginTests.spec.js --workers=1
```

If the login test passes, the setup is complete.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot find module` | Run `npm install` |
| Browser not found | Run `npx playwright install --with-deps` |
| Login test fails with timeout | Check `.env` credentials and `BASE_URL` are correct |
| `.auth/state.json` error | Run `mkdir -p .auth` and re-run tests |
| Permission denied on `.auth/` | Run `chmod 755 .auth` |

## Output

After successful setup, report:
- Node.js version
- Installed dependencies count
- Playwright browsers installed
- `.env` status (created or already exists)
- Login test result (pass/fail)
