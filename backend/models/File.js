const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
    },

    storedFileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    hash: {
      type: String,
      required: true,
      index: true,
    },

    size: {
      type: Number,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    uploadedBy: {
      type: String,
      default: "Demo User",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    ipfsCid: {
      type: String,
      default: null,
    },

    isEncrypted: {
      type: Boolean,
      default: false,
    },

    encryptionAlgorithm: {
      type: String,
      default: "AES-256-CBC",
    },

    blockchainTxHash: {
      type: String,
      default: null,
    },

    isOnChain: {
      type: Boolean,
      default: false,
    },

    version: {
      type: Number,
      default: 1,
    },

    downloadCount: {
      type: Number,
      default: 0,
    },

    // Enterprise File Management Additions
    isFavorite: {
      type: Boolean,
      default: false,
    },

    isTrashed: {
      type: Boolean,
      default: false,
    },

    trashedAt: {
      type: Date,
      default: null,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("File", fileSchema);
