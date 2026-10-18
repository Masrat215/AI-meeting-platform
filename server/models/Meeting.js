const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    originalFileName: { type: String },
    audioFilePath: { type: String },
    status: {
      type: String,
      enum: [
        "uploaded",
        "transcribing",
        "transcribed",
        "summarizing",
        "done",
        "failed",
      ],
      default: "uploaded",
    },
    createdBy: { type: String, default: "Guest" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meeting", meetingSchema);