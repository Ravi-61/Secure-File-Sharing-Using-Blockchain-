const express = require("express");
const {
  getWalletNonce,
  registerOnChain,
  verifyOnChain,
} = require("../controllers/blockchainController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get nonce challenge for Web3 wallet signing
router.get("/nonce", getWalletNonce);

// Log contract registration of a file
router.post("/register-onchain", protect, registerOnChain);

// Verify file on-chain registration status
router.get("/verify-onchain/:fileHash", verifyOnChain);

module.exports = router;
