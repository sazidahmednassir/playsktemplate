require("dotenv").config();

const config = {
  baseURL: process.env.BASE_URL,
  user2: {
    username: process.env.USER2_EMAIL,
    password: process.env.USER2_PASSWORD,
  },
  authStatePath: process.env.AUTH_STATE_PATH || ".auth/state.json",
};

module.exports = config;
