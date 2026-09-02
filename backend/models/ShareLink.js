const mongoose = require("mongoose");

const shareLinkSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    maxDownloads: {
      type: Number,
      default: 0, // 0 = unlimited
    },
    currentDownloads: {
      type: Number,
      default: 0,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    isOneTime: {
      type: Boolean,
      default: false,
    },
    allowedRoles: [
      {
        type: String,
        enum: ["User", "Admin", "Auditor"],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ShareLink", shareLinkSchema);
