const mongoose = require("mongoose");

const summarySchema = new mongoose.Schema(
  {
    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
    },
    summaryText: { type: String, default: "" },
    actionItems: [
      {
        task: { type: String, required: true },
        assignee: { type: String, default: "Unassigned" },
        deadline: { type: String, default: "Not specified" },
        completed: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Summary", summarySchema);