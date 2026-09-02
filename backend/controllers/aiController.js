const aiSecurityService = require("../services/aiSecurityService");
const File = require("../models/File");

const analyzePassword = (req, res) => {
  try {
    const { password } = req.body;
    const result = aiSecurityService.analyzePasswordStrength(password);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Password analysis failed" });
  }
};

const generatePassword = (req, res) => {
  try {
    const { length } = req.query;
    const password = aiSecurityService.generateSecurePassword(length ? parseInt(length) : 16);
    const analysis = aiSecurityService.analyzePasswordStrength(password);

    return res.status(200).json({
      generatedPassword: password,
      analysis,
    });
  } catch (error) {
    return res.status(500).json({ message: "Password generation failed" });
  }
};

const analyzeFileRiskController = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const riskAnalysis = await aiSecurityService.analyzeFileRisk(
      file.filePath,
      file.mimeType,
      file.originalName
    );

    return res.status(200).json({
      file: {
        id: file._id,
        originalName: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
        hash: file.hash,
      },
      riskAnalysis,
    });
  } catch (error) {
    return res.status(500).json({ message: "File risk analysis failed" });
  }
};

const getSecurityRecommendations = (req, res) => {
  try {
    const recommendations = aiSecurityService.generateSecurityRecommendations(12, 6);
    return res.status(200).json({ recommendations });
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate security recommendations" });
  }
};

module.exports = {
  analyzePassword,
  generatePassword,
  analyzeFileRiskController,
  getSecurityRecommendations,
};
