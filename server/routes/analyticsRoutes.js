const express = require("express");
const requireAuth = require("../middleware/auth");
const Meeting = require("../models/Meeting");
const Transcript = require("../models/Transcript");
const Summary = require("../models/Summary");
const { buildAnalytics } = require("../services/analytics");

const router = express.Router();

// Every route below needs a logged-in user
router.use(requireAuth);

// GET /api/analytics?offset=330
// offset = the user's time zone in minutes east of UTC (optional)
router.get("/", async (req, res) => {
  try {
    const parsed = parseInt(req.query.offset, 10);
    const offsetMin = Number.isNaN(parsed) ? 0 : Math.max(-840, Math.min(840, parsed));

    const meetings = await Meeting.find({ owner: req.user._id })
      .select("status createdAt durationMs")
      .lean();
    const ids = meetings.map((meeting) => meeting._id);

    const summaries = await Summary.find({ meetingId: { $in: ids } })
      .select("actionItems.assignee actionItems.completed")
      .lean();

    // Older meetings have no saved length. Work it out from the transcript instead.
    const withoutLength = meetings
      .filter((meeting) => !meeting.durationMs)
      .map((meeting) => meeting._id);
    const fallbackDurations = {};

    if (withoutLength.length > 0) {
      const transcripts = await Transcript.find({ meetingId: { $in: withoutLength } })
        .select("meetingId speakerSegments.end")
        .lean();

      for (const transcript of transcripts) {
        const last = (transcript.speakerSegments || []).reduce(
          (max, segment) => Math.max(max, segment.end || 0),
          0
        );
        fallbackDurations[String(transcript.meetingId)] = last;
      }
    }

    res.json(buildAnalytics({ meetings, summaries, fallbackDurations, offsetMin }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
