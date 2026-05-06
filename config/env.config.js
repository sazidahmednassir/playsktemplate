require("dotenv").config();

const config = {
  baseURL: process.env.BASE_URL,
  user2: {
    username: process.env.USER2_EMAIL,
    password: process.env.USER2_PASSWORD,
  },
  // eLearning23 LMS — used by Proctoring Pro tests (data/Proctoring Pro.xlsx)
  lms: {
    baseURL: process.env.LMS_BASE_URL || "https://education.elearning23.com/",
    student: {
      email: process.env.LMS_STUDENT_EMAIL,
      password: process.env.LMS_STUDENT_PASSWORD,
    },
    course: process.env.LMS_COURSE_NAME || "Computational Problem Solving",
  },
  authStatePath: process.env.AUTH_STATE_PATH || ".auth/state.json",
};

module.exports = config;
