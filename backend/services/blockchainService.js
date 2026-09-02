const crypto = require("crypto");
const File = require("../models/File");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

// In-memory nonce store for Web3 Challenge-Response signature login
const nonceStore = new Map();

class BlockchainService {
  /**
   * Generate a cryptographic nonce challenge for Web3 wallet signature authentication
   */
  generateNonce(walletAddress) {
    if (!walletAddress) {
      throw new Error("Wallet address is required");
    }

    const nonce = `Sign this message to authenticate with SecureFileSharing System: ${crypto.randomBytes(16).toString("hex")}`;
    nonceStore.set(walletAddress.toLowerCase(), {
      nonce,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 min expiry
    });

    return nonce;
  }

  /**
   * Register file on-chain record in MongoDB state
   */
  async recordOnChainRegistration(fileId, txHash, walletAddress, userId) {
    const file = await File.findById(fileId);
    if (!file) {
      throw new Error("File record not found");
    }

    file.blockchainTxHash = txHash;
    file.isOnChain = true;
    await file.save();

    await AuditLog.create({
      action: "FILE_REGISTERED_ONCHAIN",
      user: userId,
      userEmail: walletAddress,
      details: { fileId, txHash, hash: file.hash, ipfsCid: file.ipfsCid },
    });

    return file;
  }

  /**
   * Verify file on-chain metadata
   */
  async verifyOnChainFile(fileHash) {
    const file = await File.findOne({ hash: fileHash });

    if (!file || !file.isOnChain) {
      return {
        isOnChain: false,
        message: "File record not registered on blockchain",
      };
    }

    return {
      isOnChain: true,
      fileHash: file.hash,
      ipfsCid: file.ipfsCid,
      blockchainTxHash: file.blockchainTxHash,
      fileName: file.originalName,
      fileSize: file.size,
      uploadedBy: file.uploadedBy,
      createdAt: file.createdAt,
    };
  }
}

module.exports = new BlockchainService();
