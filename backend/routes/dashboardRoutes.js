const express = require("express");
const {
  getUserDashboard,
  getAdminDashboard,
  getAuditorDashboard,
} = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// User Dashboard Route
router.get("/user", protect, getUserDashboard);

// Admin Dashboard Route
router.get("/admin", protect, authorize("Admin"), getAdminDashboard);

// Auditor Dashboard Route
router.get("/auditor", protect, authorize("Auditor", "Admin"), getAuditorDashboard);

module.exports = router;
