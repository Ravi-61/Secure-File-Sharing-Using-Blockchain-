const fs = require("fs");
const path = require("path");
const fileService = require("../services/fileService");
const File = require("../models/File");
const { decryptFile } = require("../utils/fileEncryption");

// UPLOAD FILE (LOCAL DISK)
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploader = req.user?.email || "Demo User";
    const userId = req.user?._id || null;
    const result = await fileService.processFileUpload(req.file, uploader, userId);

    return res.status(201).json({
      message: "File Uploaded Successfully",
      hash: result.hash,
      file: result.file,
    });
  } catch (error) {
    console.error("[FILE UPLOAD ERROR]", error);
    return res.status(500).json({
      message: "Error uploading file",
      error: error.message,
    });
  }
};

// UPLOAD FILE TO IPFS (WITH ENCRYPTION)
const uploadToIPFSController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided for IPFS upload" });
    }

    const uploader = req.user?.email || "Demo User";
    const userId = req.user?._id || null;

    const result = await fileService.processIPFSUpload(req.file, uploader, userId);

    return res.status(201).json({
      message: "Encrypted File Uploaded to IPFS Successfully",
      file: result.file,
      ipfsCid: result.ipfs.cid,
      ipfsUrl: result.ipfs.url,
      provider: result.ipfs.provider,
    });
  } catch (error) {
    console.error("[IPFS CONTROLLER ERROR]", error);
    return res.status(500).json({
      message: "IPFS Upload Failed",
      error: error.message,
    });
  }
};

// VERIFY FILE
const verifyFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userEmail = req.user?.email || "Anonymous";
    const result = await fileService.verifyFileIntegrity(req.file, userEmail);

    if (result.isAuthentic) {
      return res.status(200).json({
        message: "✅ File is Authentic",
        status: "VALID",
        uploadedHash: result.uploadedHash,
        storedHash: result.storedHash,
        originalFile: result.originalFile,
      });
    }

    return res.status(404).json({
      message: "❌ File has been Tampered With or Not Found",
      status: "INVALID",
      uploadedHash: result.uploadedHash,
    });
  } catch (error) {
    console.error("[FILE VERIFY ERROR]", error);
    return res.status(500).json({
      message: "Verification Failed",
    });
  }
};

// ENCRYPT DEMO TEXT
const encryptDemo = (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Please provide text" });
    }

    const result = fileService.encryptDemo(text);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[ENCRYPT DEMO ERROR]", error);
    return res.status(500).json({ message: "Encryption Failed" });
  }
};

// ENCRYPT FILE
const encryptFileController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const encryptedFile = await fileService.encryptFileService(req.file);

    return res.status(200).json({
      message: "File encrypted successfully",
      encryptedFile,
    });
  } catch (error) {
    console.error("[ENCRYPT FILE ERROR]", error);
    return res.status(500).json({
      message: "Encryption failed",
      error: error.message,
    });
  }
};

// DECRYPT FILE
const decryptFileController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No encrypted file uploaded" });
    }

    const decryptedFile = await fileService.decryptFileService(req.file);

    return res.status(200).json({
      message: "File decrypted successfully",
      decryptedFile,
    });
  } catch (error) {
    console.error("[DECRYPT FILE ERROR]", error);
    return res.status(500).json({
      message: "Decryption failed",
      error: error.message,
    });
  }
};

// GET USER FILES
const getUserFilesController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { isTrashed, isFavorite } = req.query;

    const files = await fileService.getUserFiles(userId, {
      isTrashed: isTrashed === "true",
      isFavorite: isFavorite === "true" ? true : isFavorite === "false" ? false : null,
    });

    return res.status(200).json({ files });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch files" });
  }
};

// TOGGLE FAVORITE
const toggleFavoriteController = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await fileService.toggleFavorite(id, req.user._id);
    return res.status(200).json({ message: "Favorite status updated", file: updated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// MOVE TO TRASH
const moveToTrashController = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await fileService.moveToTrash(id, req.user._id);
    return res.status(200).json({ message: "Moved to trash", file: updated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// RESTORE FROM TRASH
const restoreFromTrashController = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await fileService.restoreFromTrash(id, req.user._id);
    return res.status(200).json({ message: "Restored from trash", file: updated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE FILE PERMANENTLY
const deleteFileController = async (req, res) => {
  try {
    const { id } = req.params;
    await fileService.deleteFile(id, req.user._id);
    return res.status(200).json({ message: "File permanently deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to delete file" });
  }
};

// GET FILE TIMELINE
const getFileTimelineController = async (req, res) => {
  try {
    const { id } = req.params;
    const timeline = await fileService.getFileTimeline(id);
    return res.status(200).json({ timeline });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch timeline" });
  }
};

// PREVIEW FILE STREAM
const previewFileController = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);
    if (!file) return res.status(404).json({ message: "File not found" });

    let targetPath = file.filePath;
    let isTemp = false;

    if (file.isEncrypted && fs.existsSync(file.filePath)) {
      const tempPath = path.join("uploads", `preview-${Date.now()}-${file.storedFileName.replace(".enc", "")}`);
      await decryptFile(file.filePath, tempPath);
      targetPath = tempPath;
      isTemp = true;
    }

    res.setHeader("Content-Type", file.mimeType || "application/octet-stream");
    const stream = fs.createReadStream(targetPath);
    stream.pipe(res);

    stream.on("end", () => {
      if (isTemp && fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "File preview failed" });
  }
};

module.exports = {
  uploadFile,
  uploadToIPFSController,
  verifyFile,
  encryptDemo,
  encryptFileController,
  decryptFileController,
  getUserFilesController,
  toggleFavoriteController,
  moveToTrashController,
  restoreFromTrashController,
  deleteFileController,
  getFileTimelineController,
  previewFileController,
};
