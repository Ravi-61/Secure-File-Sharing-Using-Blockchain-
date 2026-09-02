const mongoose = require("mongoose");

const fileTimelineSchema = new mongoose.Schema(
  {
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    actor: {
      type: String,
      default: "System",
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FileTimeline", fileTimelineSchema);
