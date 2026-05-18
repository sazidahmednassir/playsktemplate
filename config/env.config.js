require("dotenv").config();

const config = {
  baseURL: process.env.BASE_URL,
  user: {
    username: process.env.USER_EMAIL,
    password: process.env.USER_PASSWORD,
  },
  authStatePath: process.env.AUTH_STATE_PATH || ".auth/state.json",
};

module.exports = config;
