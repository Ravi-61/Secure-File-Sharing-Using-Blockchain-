const fs = require("fs");
const shareService = require("../services/shareService");

const createShareLink = async (req, res) => {
  try {
    const { fileId, expiryHours, maxDownloads, password, isOneTime, allowedRoles } = req.body;

    if (!fileId) {
      return res.status(400).json({ message: "fileId is required" });
    }

    const shareLink = await shareService.createShareLink({
      fileId,
      userId: req.user._id,
      expiryHours: expiryHours ? parseInt(expiryHours) : 24,
      maxDownloads: maxDownloads ? parseInt(maxDownloads) : 0,
      password,
      isOneTime: !!isOneTime,
      allowedRoles: allowedRoles || [],
    });

    const shareUrl = `${req.protocol}://${req.get("host")}/api/share/download/${shareLink.token}`;

    return res.status(201).json({
      message: "Share link generated successfully",
      token: shareLink.token,
      shareUrl,
      expiresAt: shareLink.expiresAt,
      maxDownloads: shareLink.maxDownloads,
      isOneTime: shareLink.isOneTime,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getShareLinkInfo = async (req, res) => {
  try {
    const { token } = req.params;
    const info = await shareService.getShareLinkInfo(token);
    return res.status(200).json(info);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const downloadSharedFile = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.query;

    const result = await shareService.accessAndDownloadShareFile(token, password);

    res.setHeader("Content-Disposition", `attachment; filename="${result.originalName}"`);
    res.setHeader("Content-Type", result.mimeType || "application/octet-stream");

    const fileStream = fs.createReadStream(result.downloadPath);
    fileStream.pipe(res);

    fileStream.on("end", () => {
      // Clean up temporary decrypted file if generated
      if (result.isTempDecrypted && fs.existsSync(result.downloadPath)) {
        fs.unlinkSync(result.downloadPath);
      }
    });

    fileStream.on("error", (err) => {
      console.error("[FILE STREAM ERROR]", err);
      if (!res.headersSent) {
        res.status(500).json({ message: "Error streaming file" });
      }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

module.exports = {
  createShareLink,
  getShareLinkInfo,
  downloadSharedFile,
};
