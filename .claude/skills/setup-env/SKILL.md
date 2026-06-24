---
name: setup-env
description: Set up the project environment — install dependencies, configure .env, install browsers, and verify the setup is ready to run tests.
user-invocable: true
allowed-tools: Bash Read Edit Write
---

# Setup Environment — Rentora QA Framework

Run this when setting up the project on a new machine.

## Step 1 — Dependencies
```bash
npm install
npx playwright install chromium
```

## Step 2 — `.env`
Create `.env` (see `.env.example`). Rentora uses two hosts:
```
BASE_URL=http://127.0.0.1:8000
ADMIN_BASE_URL=http://localhost:8000

OWNER_EMAIL=owner1@rentora.test
OWNER_PASSWORD=password
OWNER2_EMAIL=owner2@rentora.test
OWNER2_PASSWORD=password
ADMIN_EMAIL=admin@rentora.com.bd
ADMIN_PASSWORD=password
RENTER_EMAIL=qa.renter1@rentora.test
RENTER_PASSWORD=Password123!
```

## Step 3 — Confirm the app is running
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/        # expect 200
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/admin/dashboard  # expect 302 (guest redirect)
```

## Step 4 — Generate the test-case workbook
```bash
node scripts/generate-excel.js   # -> excel/Rentora-Testcases.xlsx
```

## Step 5 — Smoke test
```bash
npx playwright test tests/guest-browsing.spec.js
```
All guest-browsing tests should pass. If chromium is missing, re-run Step 1.

## Notes
- The MCP Playwright server is configured in `.mcp.json` for live DOM inspection
  during analysis and self-heal.
- The seeded renter is **unverified** (blocked by BUG-001); authenticated renter
  journeys require a pre-verified user seeded directly in the DB.
