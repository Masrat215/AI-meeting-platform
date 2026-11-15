const mongoose = require("mongoose");

const summarySchema = new mongoose.Schema(
  {
    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
    },
    summaryText: { type: String, default: "" },
    // Real names of speakers, for example { label: "A", name: "Priya" }
    speakers: [
      {
        _id: false,
        label: { type: String, required: true },
        name: { type: String, default: "" },
      },
    ],
    actionItems: [
      {
        task: { type: String, required: true },
        assignee: { type: String, default: "Unassigned" },
        deadline: { type: String, default: "Not specified" },
        completed: { type: Boolean, default: false },
        // When the task was ticked off (used later for analytics)
        completedAt: { type: Date, default: null },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Summary", summarySchema);
