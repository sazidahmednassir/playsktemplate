const { test: base } = require("@playwright/test");
const LoginActions = require("../../actions/LoginActions");
const DashboardActions = require("../../actions/DashboardActions");
const ProfileActions = require("../../actions/ProfileActions");
const NavigationActions = require("../../actions/NavigationActions");

exports.test = base.extend({
  actions: async ({ page }, use) => {
    const actions = {
      login: new LoginActions(page),
      dashboard: new DashboardActions(page),
      profile: new ProfileActions(page),
      navigation: new NavigationActions(page),
    };
    await use(actions);
  },
});
