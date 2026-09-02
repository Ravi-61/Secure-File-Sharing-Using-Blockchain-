const path = require("path");
const fs = require("fs");
const generateFileHash = require("../utils/hashFile");
const { encryptFile, decryptFile } = require("../utils/fileEncryption");
const { encryptText, decryptText } = require("../utils/encryption");
const ipfsService = require("./ipfsService");
const File = require("../models/File");
const AuditLog = require("../models/AuditLog");
const FileTimeline = require("../models/FileTimeline");
const Notification = require("../models/Notification");

class FileService {
  async processFileUpload(fileData, uploader = "Demo User", userId = null) {
    const hash = generateFileHash(fileData.path);

    const newFile = new File({
      originalName: fileData.originalname,
      storedFileName: fileData.filename,
      filePath: fileData.path,
      hash,
      size: fileData.size,
      mimeType: fileData.mimetype,
      uploadedBy: uploader,
      user: userId,
    });

    await newFile.save();

    await FileTimeline.create({
      file: newFile._id,
      action: "UPLOADED",
      actor: uploader,
      details: { originalName: fileData.originalname, hash },
    });

    await AuditLog.create({
      action: "FILE_UPLOADED",
      user: userId,
      userEmail: uploader,
      details: { originalName: fileData.originalname, hash },
    });

    if (userId) {
      await Notification.create({
        user: userId,
        title: "File Uploaded Successfully",
        message: `File '${fileData.originalname}' was uploaded.`,
        type: "success",
      });
    }

    return {
      hash,
      file: {
        id: newFile._id,
        originalName: fileData.originalname,
        storedFileName: fileData.filename,
        size: fileData.size,
        mimeType: fileData.mimetype,
      },
    };
  }

  async processIPFSUpload(fileData, uploader = "Demo User", userId = null) {
    const originalHash = generateFileHash(fileData.path);
    const encryptedFileName = fileData.filename + ".enc";
    const encryptedPath = path.join("uploads", encryptedFileName);

    await encryptFile(fileData.path, encryptedPath);

    if (fs.existsSync(fileData.path)) {
      fs.unlinkSync(fileData.path);
    }

    const ipfsResult = await ipfsService.uploadToIPFS(encryptedPath);

    const fileDoc = new File({
      originalName: fileData.originalname,
      storedFileName: encryptedFileName,
      filePath: encryptedPath,
      hash: originalHash,
      size: fileData.size,
      mimeType: fileData.mimetype,
      uploadedBy: uploader,
      user: userId,
      ipfsCid: ipfsResult.cid,
      isEncrypted: true,
    });

    await fileDoc.save();

    await FileTimeline.create({
      file: fileDoc._id,
      action: "ENCRYPTED_AND_IPFS_PINNED",
      actor: uploader,
      details: { cid: ipfsResult.cid, algorithm: "AES-256-CBC" },
    });

    await AuditLog.create({
      action: "FILE_IPFS_UPLOADED",
      user: userId,
      userEmail: uploader,
      details: { cid: ipfsResult.cid, originalName: fileData.originalname },
    });

    if (userId) {
      await Notification.create({
        user: userId,
        title: "File Encrypted & Stored on IPFS",
        message: `File '${fileData.originalname}' pinned to IPFS (CID: ${ipfsResult.cid}).`,
        type: "success",
      });
    }

    return {
      file: fileDoc,
      ipfs: ipfsResult,
    };
  }

  async verifyFileIntegrity(fileData, userEmail = "Anonymous") {
    const uploadedHash = generateFileHash(fileData.path);
    const existingFile = await File.findOne({ hash: uploadedHash });

    const isAuthentic = !!existingFile;

    await AuditLog.create({
      action: "FILE_VERIFIED",
      userEmail,
      status: isAuthentic ? "SUCCESS" : "FAILED",
      details: { uploadedHash, matchedFile: existingFile ? existingFile.originalName : null },
    });

    if (existingFile) {
      await FileTimeline.create({
        file: existingFile._id,
        action: "INTEGRITY_VERIFIED",
        actor: userEmail,
        details: { status: "VALID", uploadedHash },
      });

      return {
        isAuthentic: true,
        uploadedHash,
        storedHash: existingFile.hash,
        originalFile: existingFile.originalName,
      };
    }

    return {
      isAuthentic: false,
      uploadedHash,
    };
  }

  encryptDemo(text) {
    const encrypted = encryptText(text);
    const decrypted = decryptText(encrypted);
    return { original: text, encrypted, decrypted };
  }

  async encryptFileService(fileData) {
    const inputPath = fileData.path;
    const encryptedFileName = fileData.filename + ".enc";
    const outputPath = path.join("uploads", encryptedFileName);

    await encryptFile(inputPath, outputPath);

    if (fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }

    return encryptedFileName;
  }

  async decryptFileService(fileData) {
    const inputPath = fileData.path;
    const originalFileName = fileData.filename.replace(".enc", "");
    const decryptedFileName = "decrypted-" + originalFileName;
    const outputPath = path.join("uploads", decryptedFileName);

    await decryptFile(inputPath, outputPath);

    return decryptedFileName;
  }

  async getUserFiles(userId, { isTrashed = false, isFavorite = null }) {
    const query = { user: userId, isTrashed };
    if (isFavorite !== null) {
      query.isFavorite = isFavorite;
    }
    return await File.find(query).sort({ createdAt: -1 });
  }

  async toggleFavorite(fileId, userId) {
    const file = await File.findOne({ _id: fileId, user: userId });
    if (!file) throw new Error("File not found");
    file.isFavorite = !file.isFavorite;
    await file.save();
    return file;
  }

  async moveToTrash(fileId, userId) {
    const file = await File.findOne({ _id: fileId, user: userId });
    if (!file) throw new Error("File not found");
    file.isTrashed = true;
    file.trashedAt = new Date();
    await file.save();
    return file;
  }

  async restoreFromTrash(fileId, userId) {
    const file = await File.findOne({ _id: fileId, user: userId });
    if (!file) throw new Error("File not found");
    file.isTrashed = false;
    file.trashedAt = null;
    await file.save();
    return file;
  }

  async deleteFile(fileId, userId) {
    const file = await File.findById(fileId);
    if (!file) throw new Error("File not found");

    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    await File.findByIdAndDelete(fileId);

    await AuditLog.create({
      action: "FILE_PERMANENTLY_DELETED",
      user: userId,
      details: { fileId, fileName: file.originalName },
    });

    return true;
  }

  async getFileTimeline(fileId) {
    return await FileTimeline.find({ file: fileId }).sort({ createdAt: -1 });
  }
}

module.exports = new FileService();
