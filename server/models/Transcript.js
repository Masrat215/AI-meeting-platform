const mongoose = require("mongoose");

const transcriptSchema = new mongoose.Schema(
  {
    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
    },
    fullText: { type: String, default: "" },
    speakerSegments: [
      {
        speaker: String,
        text: String,
        start: Number,
        end: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transcript", transcriptSchema);