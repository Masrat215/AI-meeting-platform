const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    // The user who uploaded this meeting
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
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
    errorMessage: { type: String },
    // Length of the recording in milliseconds (saved when the transcript is ready)
    durationMs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meeting", meetingSchema);
