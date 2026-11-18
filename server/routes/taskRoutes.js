const express = require("express");
const requireAuth = require("../middleware/auth");
const Meeting = require("../models/Meeting");
const Summary = require("../models/Summary");

const router = express.Router();

// Every route below needs a logged-in user
router.use(requireAuth);

// GET /api/tasks?status=open|done|all
// Every action item from all of the user's meetings, in one list
router.get("/", async (req, res) => {
  try {
    const status = ["open", "done", "all"].includes(req.query.status)
      ? req.query.status
      : "all";

    const meetings = await Meeting.find({ owner: req.user._id }).select(
      "title createdAt"
    );
    const meetingById = new Map(meetings.map((m) => [m._id.toString(), m]));

    const summaries = await Summary.find({
      meetingId: { $in: meetings.map((m) => m._id) },
    });

    let tasks = [];
    for (const summary of summaries) {
      const meeting = meetingById.get(summary.meetingId.toString());
      if (!meeting) continue;

      for (const item of summary.actionItems) {
        tasks.push({
          id: item._id,
          meetingId: meeting._id,
          meetingTitle: meeting.title,
          meetingDate: meeting.createdAt,
          task: item.task,
          assignee: item.assignee,
          deadline: item.deadline,
          completed: item.completed,
          completedAt: item.completedAt,
        });
      }
    }

    // Counts are for all tasks, whichever filter is chosen
    const counts = {
      all: tasks.length,
      open: tasks.filter((t) => !t.completed).length,
      done: tasks.filter((t) => t.completed).length,
    };

    if (status === "open") tasks = tasks.filter((t) => !t.completed);
    if (status === "done") tasks = tasks.filter((t) => t.completed);

    // Open tasks first, then the newest meeting first
    tasks.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(b.meetingDate) - new Date(a.meetingDate);
    });

    res.json({ counts, tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
