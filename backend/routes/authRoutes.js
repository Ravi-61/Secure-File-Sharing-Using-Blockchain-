const express = require("express");
const {
  register,
  login,
  refreshTokenController,
  logout,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// REGISTER
router.post("/register", register);

// LOGIN
router.post("/login", login);

// REFRESH TOKEN
router.post("/refresh-token", refreshTokenController);

// LOGOUT
router.post("/logout", protect, logout);

// GET CURRENT USER PROFILE
router.get("/me", protect, getMe);

module.exports = router;
