const express = require("express");
const {
  getAllUsers,
  updateUserRoleOrStatus,
  getAuditLogs,
  getSecurityLogs,
  getAllSystemFiles,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// User Management Routes (Admin only)
router.get("/users", protect, authorize("Admin"), getAllUsers);
router.patch("/users/:userId", protect, authorize("Admin"), updateUserRoleOrStatus);

// Audit & Security Logs (Admin & Auditor)
router.get("/audit-logs", protect, authorize("Admin", "Auditor"), getAuditLogs);
router.get("/security-logs", protect, authorize("Admin", "Auditor"), getSecurityLogs);

// System File Explorer (Admin only)
router.get("/system-files", protect, authorize("Admin"), getAllSystemFiles);

module.exports = router;
