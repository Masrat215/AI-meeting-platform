const express = require("express");
const upload = require("../middleware/upload");
const Meeting = require("../models/Meeting");
const Transcript = require("../models/Transcript");
const Summary = require("../models/Summary");
const { processMeeting } = require("../services/meetingProcessor");

const router = express.Router();

// POST /api/meetings/upload -> receive audio, create meeting, start processing
router.post("/upload", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please attach an audio file" });
    }

    const title = req.body.title || req.file.originalname;

    const meeting = await Meeting.create({
      title,
      originalFileName: req.file.originalname,
      audioFilePath: req.file.path,
      createdBy: req.body.createdBy || "Guest",
    });

    // Reply straight away; the transcription continues in the background
    res.status(201).json({ message: "Audio uploaded successfully", meeting });

    processMeeting(meeting._id);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/meetings -> list all meetings, newest first
router.get("/", async (req, res) => {
  try {
    const meetings = await Meeting.find().sort({ createdAt: -1 });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/meetings/:id -> one meeting with its transcript and summary
router.get("/:id", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    const transcript = await Transcript.findOne({ meetingId: meeting._id });
    const summary = await Summary.findOne({ meetingId: meeting._id });

    res.json({ meeting, transcript, summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;