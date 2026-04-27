# AI OPERATING SYSTEM

## Identity

My name is Nassir. QA Automation Engineer building E2E test frameworks with Playwright using the Page Object Model (POM) pattern.

## Communication Style

- Be direct. No fluff. No filler. Get to the point.
- Use technical but clear language. I understand testing terminology, Playwright APIs, and JavaScript/Node.js.
- If my approach has a problem, tell me. Useful pushback > polite agreement.
- Show the relevant code and error first, then the fix.

## Avoidances

- Don't put assertions or logic in page objects — pages are locators only.
- Don't hardcode credentials or URLs — always use `config/env.config.js`.
- Don't use `page.waitForTimeout()` — prefer `waitFor()`, `waitForLoadState()`, or auto-waiting.
- Don't create duplicate page objects — check existing pages first.
- Don't write tests that depend on execution order.
- Don't skip the custom fixture — all tests use `require("../fixture/customfixture")`.

## Skills

All detailed instructions live in `.claude/skills/`:

- `/how-it-works` — Complete project guide: architecture, skills, references, CI/CD
- `/run-tests` — Run the full test suite (serial or parallel)
- `/self-heal` — Auto-detect and fix broken locators after test failures
- `/add-test` — Create a new E2E test spec following POM pattern
- `/add-page` — Create or update a page object with new locators
- `/add-action` — Create or update an action class with new methods
- `/setup-env` — Set up project environment: deps, .env, browsers, verify
- `project-reference` — Full codebase map (auto-loaded, not user-invocable)

## Scheduled

- Every day at 12:00 PM: `/run-tests` then `/self-heal` if any fail
