const mongoose = require("mongoose");

const securityLogSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "LOW",
    },
    sourceIp: {
      type: String,
      default: "Unknown",
    },
    targetUser: {
      type: String,
      default: "System",
    },
    description: {
      type: String,
      required: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SecurityLog", securityLogSchema);
