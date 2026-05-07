require("dotenv").config();
const path = require("path");

// Absolute paths to the still-image / Y4M fixtures used by Proctoring Pro tests.
// See data/fixtures/face/README.md for how these get fed to Chromium as a fake camera.
const FACE_DIR = path.resolve(__dirname, "..", "data", "fixtures", "face");
const faceFixtures = {
  dir: FACE_DIR,
  baseline: path.join(FACE_DIR, "baseline.y4m"),
  mismatch: path.join(FACE_DIR, "mismatch.y4m"),
  noFace: path.join(FACE_DIR, "no-face.y4m"),
  multiFace: path.join(FACE_DIR, "multi-face.y4m"),
};

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
    quizName: process.env.LMS_QUIZ_NAME || "Test Quiz",
    faceFixtures,
    // When true, tests use the real webcam instead of a Y4M file.
    useRealCamera: String(process.env.USE_REAL_CAMERA).toLowerCase() === "true",
  },
  authStatePath: process.env.AUTH_STATE_PATH || ".auth/state.json",
};

module.exports = config;
