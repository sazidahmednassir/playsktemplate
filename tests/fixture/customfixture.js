// Custom Playwright fixture — injects an `actions` namespace into every test.
// Per CLAUDE.md: every test MUST `require("../fixture/customfixture")`.
//
// Action classes are loaded via safeRequire() so this fixture works on a fresh
// codebase. As you create new action files under `actions/`, register them
// below and they'll be available on the `actions` fixture in every spec.

const { test: base } = require("@playwright/test");

function safeRequire(modPath) {
  try {
    return require(modPath);
  } catch (e) {
    if (e && e.code === "MODULE_NOT_FOUND") return null;
    throw e;
  }
}

// Register action classes here as you add them.
// Example: const LoginActions = safeRequire("../../actions/LoginActions");

exports.test = base.extend({
  actions: async ({ page }, use) => {
    const actions = {};
    // Example: if (LoginActions) actions.login = new LoginActions(page);
    await use(actions);
  },
});
