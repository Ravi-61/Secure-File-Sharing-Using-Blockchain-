const express = require("express");
const {
  analyzePassword,
  generatePassword,
  analyzeFileRiskController,
  getSecurityRecommendations,
} = require("../controllers/aiController");

const router = express.Router();

// Password Strength Analysis Endpoint
router.post("/analyze-password", analyzePassword);

// Secure Password Generator Endpoint
router.get("/generate-password", generatePassword);

// File Risk Evaluation Endpoint
router.get("/analyze-file-risk/:fileId", analyzeFileRiskController);

// AI System Security Recommendations Endpoint
router.get("/recommendations", getSecurityRecommendations);

module.exports = router;
