// Custom Playwright fixture — injects an `actions` namespace into every test.
// Per CLAUDE.md: every test MUST `require("../fixture/customfixture")`.
//
// NOTE: The original CLAUDE.md references LoginActions / DashboardActions /
// ProfileActions / NavigationActions for OrangeHRM. Their action files do not
// yet exist in the repo. They are reintroduced here as graceful require()s so
// the fixture works today (LMS tests) and lights up automatically once those
// action classes are created.

const { test: base } = require("@playwright/test");

function safeRequire(modPath) {
  try {
    return require(modPath);
  } catch (e) {
    if (e && e.code === "MODULE_NOT_FOUND") return null;
    throw e;
  }
}

const LoginActions = safeRequire("../../actions/LoginActions");
const DashboardActions = safeRequire("../../actions/DashboardActions");
const ProfileActions = safeRequire("../../actions/ProfileActions");
const NavigationActions = safeRequire("../../actions/NavigationActions");
const StudentLMSActions = safeRequire("../../actions/StudentLMSActions");

exports.test = base.extend({
  actions: async ({ page }, use) => {
    const actions = {};
    if (LoginActions) actions.login = new LoginActions(page);
    if (DashboardActions) actions.dashboard = new DashboardActions(page);
    if (ProfileActions) actions.profile = new ProfileActions(page);
    if (NavigationActions) actions.navigation = new NavigationActions(page);
    if (StudentLMSActions) actions.studentLms = new StudentLMSActions(page);
    await use(actions);
  },
});
