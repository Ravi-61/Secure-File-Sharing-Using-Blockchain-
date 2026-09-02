const crypto = require("crypto");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const ShareLink = require("../models/ShareLink");
const File = require("../models/File");
const AuditLog = require("../models/AuditLog");
const { decryptFile } = require("../utils/fileEncryption");

class ShareService {
  async createShareLink({
    fileId,
    userId,
    expiryHours = 24,
    maxDownloads = 0,
    password = null,
    isOneTime = false,
    allowedRoles = [],
  }) {
    const file = await File.findById(fileId);
    if (!file) {
      const error = new Error("File not found");
      error.statusCode = 404;
      throw error;
    }

    const token = crypto.randomBytes(24).toString("hex");

    let expiresAt = null;
    if (expiryHours > 0) {
      expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    }

    let passwordHash = null;
    if (password && password.trim().length > 0) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const shareLink = new ShareLink({
      token,
      file: fileId,
      createdBy: userId,
      expiresAt,
      maxDownloads,
      passwordHash,
      isOneTime,
      allowedRoles,
    });

    await shareLink.save();

    await AuditLog.create({
      action: "SHARE_LINK_CREATED",
      user: userId,
      details: { fileId, token, expiryHours, isOneTime },
    });

    return shareLink;
  }

  async getShareLinkInfo(token) {
    const shareLink = await ShareLink.findOne({ token, isActive: true }).populate(
      "file",
      "originalName size mimeType hash isEncrypted ipfsCid"
    );

    if (!shareLink) {
      const error = new Error("Share link is invalid or expired");
      error.statusCode = 404;
      throw error;
    }

    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
      shareLink.isActive = false;
      await shareLink.save();
      const error = new Error("Share link has expired");
      error.statusCode = 410;
      throw error;
    }

    if (
      shareLink.maxDownloads > 0 &&
      shareLink.currentDownloads >= shareLink.maxDownloads
    ) {
      shareLink.isActive = false;
      await shareLink.save();
      const error = new Error("Maximum download limit reached for this link");
      error.statusCode = 410;
      throw error;
    }

    return {
      token: shareLink.token,
      file: shareLink.file,
      requiresPassword: !!shareLink.passwordHash,
      isOneTime: shareLink.isOneTime,
      expiresAt: shareLink.expiresAt,
      maxDownloads: shareLink.maxDownloads,
      currentDownloads: shareLink.currentDownloads,
    };
  }

  async accessAndDownloadShareFile(token, password = null) {
    const shareLink = await ShareLink.findOne({ token, isActive: true }).populate("file");

    if (!shareLink) {
      const error = new Error("Share link invalid or inactive");
      error.statusCode = 404;
      throw error;
    }

    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
      shareLink.isActive = false;
      await shareLink.save();
      const error = new Error("Share link has expired");
      error.statusCode = 410;
      throw error;
    }

    if (
      shareLink.maxDownloads > 0 &&
      shareLink.currentDownloads >= shareLink.maxDownloads
    ) {
      shareLink.isActive = false;
      await shareLink.save();
      const error = new Error("Maximum download limit reached");
      error.statusCode = 410;
      throw error;
    }

    // Password verification if required
    if (shareLink.passwordHash) {
      if (!password) {
        const error = new Error("Password required to access this file");
        error.statusCode = 401;
        throw error;
      }

      const isMatch = await bcrypt.compare(password, shareLink.passwordHash);
      if (!isMatch) {
        const error = new Error("Incorrect passcode for share link");
        error.statusCode = 403;
        throw error;
      }
    }

    // Update download metrics
    shareLink.currentDownloads += 1;
    if (
      shareLink.isOneTime ||
      (shareLink.maxDownloads > 0 && shareLink.currentDownloads >= shareLink.maxDownloads)
    ) {
      shareLink.isActive = false;
    }
    await shareLink.save();

    const file = shareLink.file;

    // Handle decryption if encrypted file on disk
    let downloadPath = file.filePath;
    let isTempDecrypted = false;

    if (file.isEncrypted && fs.existsSync(file.filePath)) {
      const tempDecryptedPath = path.join("uploads", `temp-share-${Date.now()}-${file.storedFileName.replace(".enc", "")}`);
      await decryptFile(file.filePath, tempDecryptedPath);
      downloadPath = tempDecryptedPath;
      isTempDecrypted = true;
    }

    await AuditLog.create({
      action: "SHARE_LINK_DOWNLOADED",
      details: { token, fileId: file._id, originalName: file.originalName },
    });

    return {
      downloadPath,
      originalName: file.originalName,
      mimeType: file.mimeType,
      isTempDecrypted,
    };
  }
}

module.exports = new ShareService();
