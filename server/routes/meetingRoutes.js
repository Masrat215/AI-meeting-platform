   const express = require("express");
   const fs = require("fs");
   const mongoose = require("mongoose");
   const upload = require("../middleware/upload");
   const requireAuth = require("../middleware/auth");
   const checkUploadLimit = require("../middleware/uploadLimit");
   const Meeting = require("../models/Meeting");
   const Transcript = require("../models/Transcript");
   const Summary = require("../models/Summary");
   const { processMeeting } = require("../services/meetingProcessor");

   const router = express.Router();

   // Every route below needs a logged-in user
   router.use(requireAuth);

   const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

   // Finds a meeting only if it belongs to the logged-in user
   const findOwnMeeting = (req) => {
     if (!isValidId(req.params.id)) return null;
     return Meeting.findOne({ _id: req.params.id, owner: req.user._id });
   };

   // POST /api/meetings/upload -> receive audio, create meeting, start processing
   router.post(
     "/upload",
     checkUploadLimit,
     upload.single("audio"),
     async (req, res) => {
       try {
         if (!req.file) {
           return res.status(400).json({ error: "Please attach an audio file" });
         }

         const title = (req.body && req.body.title) || req.file.originalname;

         const meeting = await Meeting.create({
           owner: req.user._id,
           title,
           originalFileName: req.file.originalname,
           audioFilePath: req.file.path,
         });

         // Reply straight away; the processing continues in the background
         res.status(201).json({ message: "Audio uploaded successfully", meeting });

         processMeeting(meeting._id);
       } catch (error) {
         res.status(500).json({ error: error.message });
       }
     }
   );

   // GET /api/meetings -> the user's meetings, newest first
   router.get("/", async (req, res) => {
     try {
       const meetings = await Meeting.find({ owner: req.user._id }).sort({
         createdAt: -1,
       });
       res.json(meetings);
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });

   // GET /api/meetings/:id -> one meeting with its transcript and summary
   router.get("/:id", async (req, res) => {
     try {
       const meeting = await findOwnMeeting(req);
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
       const meeting = await findOwnMeeting(req);
       if (!meeting) {
         return res.status(404).json({ error: "Meeting not found" });
       }

       if (meeting.status !== "failed") {
         return res.status(400).json({ error: "Only failed meetings can be retried" });
       }

       if (!meeting.audioFilePath || !fs.existsSync(meeting.audioFilePath)) {
         return res.status(400).json({
           error:
             "The audio file is no longer on the server. Please upload the recording again.",
         });
       }

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
       const meeting = await findOwnMeeting(req);
       if (!meeting) {
         return res.status(404).json({ error: "Meeting not found" });
       }

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