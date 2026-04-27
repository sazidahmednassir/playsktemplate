require("dotenv").config();

const config = {
  baseURL: process.env.BASE_URL,
  user2: {
    username: process.env.USER2_EMAIL,
    password: process.env.USER2_PASSWORD,
  },
};

module.exports = config;
