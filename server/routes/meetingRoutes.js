   const express = require("express");
   const fs = require("fs");
   const mongoose = require("mongoose");
   const upload = require("../middleware/upload");
   const Meeting = require("../models/Meeting");
   const Transcript = require("../models/Transcript");
   const Summary = require("../models/Summary");
   const { processMeeting } = require("../services/meetingProcessor");

   const router = express.Router();

   // True when the text looks like a valid MongoDB ID
   const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

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

       // Reply straight away; the processing continues in the background
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
       if (!isValidId(req.params.id)) {
         return res.status(404).json({ error: "Meeting not found" });
       }

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

   // POST /api/meetings/:id/retry -> run a failed meeting again from the start
   router.post("/:id/retry", async (req, res) => {
     try {
       if (!isValidId(req.params.id)) {
         return res.status(404).json({ error: "Meeting not found" });
       }

       const meeting = await Meeting.findById(req.params.id);
       if (!meeting) {
         return res.status(404).json({ error: "Meeting not found" });
       }

       if (meeting.status !== "failed") {
         return res.status(400).json({ error: "Only failed meetings can be retried" });
       }

       if (!meeting.audioFilePath || !fs.existsSync(meeting.audioFilePath)) {
         return res.status(400).json({
           error: "The audio file is no longer on the server. Please upload the recording again.",
         });
       }

       // Clear any partial results, then start again
       await Transcript.deleteMany({ meetingId: meeting._id });
       await Summary.deleteMany({ meetingId: meeting._id });

       meeting.status = "uploaded";
       meeting.errorMessage = undefined;
       await meeting.save();

       res.json({ message: "Retry started", meeting });

       processMeeting(meeting._id);
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });

   // DELETE /api/meetings/:id -> remove a meeting, its results and its audio file
   router.delete("/:id", async (req, res) => {
     try {
       if (!isValidId(req.params.id)) {
         return res.status(404).json({ error: "Meeting not found" });
       }

       const meeting = await Meeting.findById(req.params.id);
       if (!meeting) {
         return res.status(404).json({ error: "Meeting not found" });
       }

       // Delete the audio file too (ignore the error if it is already gone)
       if (meeting.audioFilePath) {
         await fs.promises.unlink(meeting.audioFilePath).catch(() => {});
       }

       await Transcript.deleteMany({ meetingId: meeting._id });
       await Summary.deleteMany({ meetingId: meeting._id });
       await meeting.deleteOne();

       res.json({ message: "Meeting deleted" });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });

   module.exports = router;