// Custom Playwright fixture — injects an `actions` namespace into every test.
// Per CLAUDE.md: every test MUST `require("../fixture/customfixture")`.
//
// Action classes are loaded via safeRequire() so this fixture works even on a
// partially-built tree. Register new action classes below as you add them.

const { test: base } = require("@playwright/test");

function safeRequire(modPath) {
  try {
    return require(modPath);
  } catch (e) {
    if (e && e.code === "MODULE_NOT_FOUND") return null;
    throw e;
  }
}

const AdminAuthActions = safeRequire("../../actions/AdminAuthActions");
const OrderActions = safeRequire("../../actions/OrderActions");
const ReturnActions = safeRequire("../../actions/ReturnActions");
const InventoryActions = safeRequire("../../actions/InventoryActions");
const StoreFrontActions = safeRequire("../../actions/StoreFrontActions");

exports.test = base.extend({
  actions: async ({ page }, use) => {
    const actions = {};
    if (AdminAuthActions) actions.auth = new AdminAuthActions(page);
    if (OrderActions) actions.orders = new OrderActions(page);
    if (ReturnActions) actions.returns = new ReturnActions(page);
    if (InventoryActions) actions.inventory = new InventoryActions(page);
    if (StoreFrontActions) actions.store = new StoreFrontActions(page);
    await use(actions);
  },
});
