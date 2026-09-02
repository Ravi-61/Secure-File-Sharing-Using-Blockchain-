const express = require("express");
const {
  createShareLink,
  getShareLinkInfo,
  downloadSharedFile,
} = require("../controllers/shareController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Generate Encrypted Share Link
router.post("/create", protect, createShareLink);

// Get Share Link Metadata (Public for Portal UI)
router.get("/info/:token", getShareLinkInfo);

// Download File via Share Token
router.get("/download/:token", downloadSharedFile);

module.exports = router;
