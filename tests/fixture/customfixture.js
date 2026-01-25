const { test: base } = require("@playwright/test");
const LoginActions = require("../../actions/LoginActions");
const ProfileActions = require("../../actions/ProfileActions");

exports.test = base.extend({
  actions: async ({ page }, use) => {
    const actions = {
      login: new LoginActions(page),
      profile: new ProfileActions(page),
    };
    await use(actions);
  },
});
