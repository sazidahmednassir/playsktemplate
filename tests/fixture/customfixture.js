const { test: base } = require("@playwright/test");
const LoginActions = require("../../actions/LoginActions");
const TenantSwitchActions = require("../../actions/tenantSwitchActions");

exports.test = base.extend({
  actions: async ({ page }, use) => {
    const actions = {
      login: new LoginActions(page),
      tenantSwitch: new TenantSwitchActions(page),
    };
    await use(actions);
  },
});
